import {
    createContext,
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { AppState, AppStateStatus, Animated, Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    clearAuthSession,
    getAuthSession,
    getStoredPushRegistration,
    setStoredPushRegistration,
} from "@/services/auth/session.service";
import {
    getNotificationUnreadCount,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    registerNotificationDevice,
    unregisterNotificationDevice,
} from "@/services/notifications/notification.service";
import {
    NotificationEntityType,
    NotificationEventType,
    NotificationItem,
    NotificationSocketMessage,
    RegisterNotificationDevicePayload,
    StoredAuthSession,
} from "@/types/notifications";

const FIRST_PAGE_LIMIT = 20;
const MAX_RECONNECT_DELAY_MS = 30000;
const CUSTOMER_EVENTS = new Set<NotificationEventType>([
    "OFFER_CREATED",
    "OFFER_UPDATED",
    "OFFER_WITHDRAWN",
    "ORDER_CREATED",
    "ORDER_STATUS_UPDATED",
    "ORDER_CANCELLED",
    "ORDER_MARKED_PAID",
    "ORDER_REFUNDED",
    "REQUEST_CANCELLED",
    "USER_SUSPENDED",
    "USER_REACTIVATED",
]);

type NotificationContextValue = {
    notifications: NotificationItem[];
    unreadCount: number;
    unreadOnly: boolean;
    isReady: boolean;
    isRefreshing: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    isSocketConnected: boolean;
    initializeSession: (session?: StoredAuthSession | null) => Promise<void>;
    reconnect: () => void;
    refresh: (options?: { refreshList?: boolean }) => Promise<void>;
    loadMore: () => Promise<void>;
    setUnreadOnly: (value: boolean) => Promise<void>;
    markAsRead: (notification: NotificationItem) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    handleNotificationPress: (notification: NotificationItem) => Promise<void>;
    registerPushToken: (
        registration: RegisterNotificationDevicePayload
    ) => Promise<void>;
    clearForLogout: () => Promise<void>;
};

export const NotificationContext = createContext<NotificationContextValue | null>(
    null
);

const getWsUrl = (token: string) => {
    const baseUrl = process.env.EXPO_PUBLIC_NETWORK_BASE_URL ?? "";
    const wsBase = baseUrl.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
    return `${wsBase.replace(/\/$/, "")}/ws?token=${encodeURIComponent(token)}`;
};

const isUnauthorizedError = (error: unknown) =>
    axios.isAxiosError(error) && error.response?.status === 401;

const isEphemeralNotification = (notification: NotificationItem) =>
    notification.isLive || notification.id.startsWith("live:");

const roleAllowsEvent = (
    role: StoredAuthSession["role"],
    eventType: string
) => {
    if (role !== "user") return true;
    return CUSTOMER_EVENTS.has(eventType as NotificationEventType);
};

const getNavigationTarget = (notification: NotificationItem) => {
    const { entity_type, entity_id, data } = notification;
    const payload = data ?? {};

    switch (entity_type as NotificationEntityType) {
        case "request":
            return entity_id ? (`/requests/${entity_id}` as const) : "/(tabs)/requests";
        case "offer": {
            const requestId = String(payload.request_id ?? payload.requestId ?? entity_id ?? "");
            return requestId ? (`/requests/${requestId}?ref=Offer` as const) : "/(tabs)/requests";
        }
        case "order":
            return entity_id ? (`/orders/${entity_id}` as const) : "/(tabs)/orders";
        case "user":
            return "/(tabs)/profile" as const;
        default:
            return "/(tabs)/notifications" as const;
    }
};

const formatLiveNotification = (
    message: NotificationSocketMessage
): NotificationItem => ({
    id: `live:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    type: message.type,
    title: message.data.title,
    body: message.data.body,
    entity_type: message.data.entity_type,
    entity_id: message.data.entity_id,
    actor_user_id: message.data.actor_user_id,
    data: message.data.data,
    is_read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    isLive: true,
});

export function NotificationProvider({ children }: PropsWithChildren) {
    const queryClient = useQueryClient();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadOnly, setUnreadOnlyState] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [bannerNotification, setBannerNotification] =
        useState<NotificationItem | null>(null);
    const sessionRef = useRef<StoredAuthSession | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptRef = useRef(0);
    const foregroundStateRef = useRef(AppState.currentState);
    const manualDisconnectRef = useRef(false);
    const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bannerTranslateY = useRef(new Animated.Value(-120)).current;

    const clearReconnectTimer = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    const disconnectSocket = useCallback(() => {
        clearReconnectTimer();
        const socket = socketRef.current;
        socketRef.current = null;

        if (socket) {
            socket.onopen = null;
            socket.onmessage = null;
            socket.onerror = null;
            socket.onclose = null;
            socket.close();
        }

        setIsSocketConnected(false);
    }, [clearReconnectTimer]);

    const resetLocalState = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        setUnreadOnlyState(false);
        setHasMore(true);
        setIsSocketConnected(false);
        setBannerNotification(null);
        reconnectAttemptRef.current = 0;
        manualDisconnectRef.current = true;
    }, []);

    const handleUnauthorized = useCallback(async () => {
        disconnectSocket();
        sessionRef.current = null;
        resetLocalState();
        await clearAuthSession();
        queryClient.clear();
        router.replace("/(auth)/login");
    }, [disconnectSocket, queryClient, resetLocalState]);

    const showBanner = useCallback(
        (notification: NotificationItem) => {
            if (bannerTimerRef.current) {
                clearTimeout(bannerTimerRef.current);
            }

            setBannerNotification(notification);
            Animated.spring(bannerTranslateY, {
                toValue: 0,
                useNativeDriver: true,
                damping: 18,
                stiffness: 180,
            }).start();

            bannerTimerRef.current = setTimeout(() => {
                Animated.timing(bannerTranslateY, {
                    toValue: -120,
                    duration: 180,
                    useNativeDriver: true,
                }).start(({ finished }) => {
                    if (finished) {
                        setBannerNotification((current) =>
                            current?.id === notification.id ? null : current
                        );
                    }
                });
            }, 4200);
        },
        [bannerTranslateY]
    );

    const refreshUnreadCount = useCallback(async () => {
        const response = await getNotificationUnreadCount();
        const count = Number(
            response.data.unread_count ?? response.data.count ?? 0
        );
        setUnreadCount(Number.isFinite(count) ? count : 0);
    }, []);

    const refreshFirstPage = useCallback(
        async (nextUnreadOnly = unreadOnly) => {
            const response = await getNotifications({
                limit: FIRST_PAGE_LIMIT,
                offset: 0,
                unreadOnly: nextUnreadOnly,
            });

            const items = Array.isArray(response.data) ? response.data : [];
            setNotifications(items);
            setHasMore(items.length >= FIRST_PAGE_LIMIT);
        },
        [unreadOnly]
    );

    const connectSocket = useCallback(async () => {
        const session = sessionRef.current ?? (await getAuthSession());
        if (!session?.token) {
            return;
        }

        manualDisconnectRef.current = false;
        disconnectSocket();

        const socket = new WebSocket(getWsUrl(session.token));
        socketRef.current = socket;

        socket.onopen = () => {
            reconnectAttemptRef.current = 0;
            setIsSocketConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as NotificationSocketMessage;
                if (!roleAllowsEvent(session.role, message.type)) {
                    return;
                }

                const nextNotification = formatLiveNotification(message);
                setNotifications((current) => [nextNotification, ...current]);
                setUnreadCount((current) => current + 1);
                showBanner(nextNotification);
            } catch (error) {
                console.log("WS message parse error", error);
            }
        };

        socket.onerror = () => {
            setIsSocketConnected(false);
        };

        socket.onclose = async (event) => {
            setIsSocketConnected(false);
            socketRef.current = null;

            if ([1008, 4001, 4401].includes(event.code)) {
                await handleUnauthorized();
                return;
            }

            clearReconnectTimer();
            if (manualDisconnectRef.current || !sessionRef.current?.token) {
                return;
            }

            const delay = Math.min(
                1000 * 2 ** reconnectAttemptRef.current,
                MAX_RECONNECT_DELAY_MS
            );
            reconnectAttemptRef.current += 1;

            reconnectTimerRef.current = setTimeout(() => {
                void connectSocket();
            }, delay);
        };
    }, [clearReconnectTimer, disconnectSocket, handleUnauthorized, showBanner]);

    const initializeSession = useCallback(
        async (session?: StoredAuthSession | null) => {
            const nextSession = session ?? (await getAuthSession());
            sessionRef.current = nextSession;

            if (!nextSession?.token) {
                disconnectSocket();
                resetLocalState();
                setIsReady(true);
                return;
            }

            setIsRefreshing(true);

            try {
                await Promise.all([refreshUnreadCount(), refreshFirstPage(false)]);

                const storedPush = await getStoredPushRegistration();
                if (storedPush?.token) {
                    await registerNotificationDevice(storedPush);
                }

                await connectSocket();
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    await handleUnauthorized();
                    return;
                }
                console.log("Notification bootstrap error", error);
            } finally {
                setIsRefreshing(false);
                setIsReady(true);
            }
        },
        [
            connectSocket,
            disconnectSocket,
            handleUnauthorized,
            refreshFirstPage,
            refreshUnreadCount,
            resetLocalState,
        ]
    );

    const refresh = useCallback(
        async (options?: { refreshList?: boolean }) => {
            if (!sessionRef.current?.token) return;

            setIsRefreshing(true);
            try {
                await refreshUnreadCount();
                if (options?.refreshList ?? true) {
                    await refreshFirstPage();
                }
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    await handleUnauthorized();
                    return;
                }
                console.log("Notification refresh error", error);
            } finally {
                setIsRefreshing(false);
            }
        },
        [handleUnauthorized, refreshFirstPage, refreshUnreadCount]
    );

    const loadMore = useCallback(async () => {
        if (!sessionRef.current?.token || isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);
        try {
            const persistedCount = notifications.filter((item) => !item.isLive).length;
            const response = await getNotifications({
                limit: FIRST_PAGE_LIMIT,
                offset: persistedCount,
                unreadOnly,
            });
            const nextItems = Array.isArray(response.data) ? response.data : [];
            setNotifications((current) => {
                const existingIds = new Set(current.map((item) => item.id));
                const dedupedNext = nextItems.filter((item) => !existingIds.has(item.id));
                return [...current, ...dedupedNext];
            });
            setHasMore(nextItems.length >= FIRST_PAGE_LIMIT);
        } catch (error) {
            if (isUnauthorizedError(error)) {
                await handleUnauthorized();
                return;
            }
            console.log("Notification pagination error", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [
        hasMore,
        handleUnauthorized,
        isLoadingMore,
        notifications.length,
        unreadOnly,
    ]);

    const resolvePersistedNotification = useCallback(
        async (notification: NotificationItem): Promise<NotificationItem | null> => {
            const response = await getNotifications({
                limit: FIRST_PAGE_LIMIT,
                offset: 0,
                unreadOnly: false,
            });

            const items = Array.isArray(response.data) ? response.data : [];
            const match =
                items.find(
                    (item) =>
                        item.type === notification.type &&
                        item.entity_type === notification.entity_type &&
                        item.entity_id === notification.entity_id &&
                        item.title === notification.title &&
                        item.body === notification.body
                ) ?? null;

            setNotifications((current) => {
                const filtered = current.filter((item) => item.id !== notification.id);
                return match ? [match, ...filtered] : filtered;
            });

            return match;
        },
        []
    );

    const markAsRead = useCallback(
        async (notification: NotificationItem) => {
            let target = notification;

            try {
                if (isEphemeralNotification(notification)) {
                    const resolved = await resolvePersistedNotification(notification);
                    if (!resolved) {
                        await refresh({ refreshList: true });
                        return;
                    }
                    target = resolved;
                }

                if (!target.is_read) {
                    await markNotificationAsRead(target.id);
                }

                setNotifications((current) =>
                    current.map((item) =>
                        item.id === target.id
                            ? {
                                ...item,
                                is_read: true,
                                read_at: item.read_at ?? new Date().toISOString(),
                                isLive: false,
                            }
                            : item
                    )
                );
                setUnreadCount((current) => Math.max(current - 1, 0));
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    await handleUnauthorized();
                    return;
                }
                console.log("Mark notification read error", error);
            }
        },
        [handleUnauthorized, refresh, resolvePersistedNotification]
    );

    const markAllAsRead = useCallback(async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications((current) =>
                current.map((item) => ({
                    ...item,
                    is_read: true,
                    read_at: item.read_at ?? new Date().toISOString(),
                    isLive: false,
                }))
            );
            setUnreadCount(0);
        } catch (error) {
            if (isUnauthorizedError(error)) {
                await handleUnauthorized();
                return;
            }
            console.log("Mark all notifications read error", error);
        }
    }, [handleUnauthorized]);

    const handleNotificationPress = useCallback(
        async (notification: NotificationItem) => {
            if (!notification.is_read) {
                await markAsRead(notification);
            }
            router.push(getNavigationTarget(notification) as any);
        },
        [markAsRead]
    );

    const updateUnreadOnly = useCallback(
        async (value: boolean) => {
            setUnreadOnlyState(value);
            setIsRefreshing(true);
            try {
                await refreshUnreadCount();
                await refreshFirstPage(value);
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    await handleUnauthorized();
                    return;
                }
                console.log("Unread filter refresh error", error);
            } finally {
                setIsRefreshing(false);
            }
        },
        [handleUnauthorized, refreshFirstPage, refreshUnreadCount]
    );

    const registerPushToken = useCallback(
        async (registration: RegisterNotificationDevicePayload) => {
            await setStoredPushRegistration(registration);

            if (!sessionRef.current?.token) {
                return;
            }

            try {
                await registerNotificationDevice(registration);
            } catch (error) {
                if (isUnauthorizedError(error)) {
                    await handleUnauthorized();
                    return;
                }
                console.log("Push registration error", error);
            }
        },
        [handleUnauthorized]
    );

    const clearForLogout = useCallback(async () => {
        const storedPush = await getStoredPushRegistration();

        manualDisconnectRef.current = true;
        disconnectSocket();
        sessionRef.current = null;
        resetLocalState();

        if (storedPush?.token) {
            try {
                await unregisterNotificationDevice({ token: storedPush.token });
            } catch (error) {
                console.log("Push unregister error", error);
            }
        }
    }, [disconnectSocket, resetLocalState]);

    useEffect(() => {
        void initializeSession();

        return () => {
            if (bannerTimerRef.current) {
                clearTimeout(bannerTimerRef.current);
            }
            manualDisconnectRef.current = true;
            disconnectSocket();
        };
    }, [disconnectSocket, initializeSession]);

    useEffect(() => {
        const subscription = AppState.addEventListener(
            "change",
            (nextState: AppStateStatus) => {
                const wasBackgrounded =
                    foregroundStateRef.current === "background" ||
                    foregroundStateRef.current === "inactive";

                foregroundStateRef.current = nextState;

                if (nextState === "active" && wasBackgrounded) {
                    if (!socketRef.current && sessionRef.current?.token) {
                        void connectSocket();
                    }
                    void refresh({ refreshList: true });
                }
            }
        );

        return () => {
            subscription.remove();
        };
    }, [connectSocket, refresh]);

    const value = useMemo<NotificationContextValue>(
        () => ({
            notifications,
            unreadCount,
            unreadOnly,
            isReady,
            isRefreshing,
            isLoadingMore,
            hasMore,
            isSocketConnected,
            initializeSession,
            reconnect: () => {
                if (!socketRef.current && sessionRef.current?.token) {
                    void connectSocket();
                }
            },
            refresh,
            loadMore,
            setUnreadOnly: updateUnreadOnly,
            markAsRead,
            markAllAsRead,
            handleNotificationPress,
            registerPushToken,
            clearForLogout,
        }),
        [
            clearForLogout,
            connectSocket,
            handleNotificationPress,
            hasMore,
            initializeSession,
            isLoadingMore,
            isReady,
            isRefreshing,
            isSocketConnected,
            loadMore,
            markAllAsRead,
            markAsRead,
            notifications,
            refresh,
            registerPushToken,
            unreadCount,
            unreadOnly,
            updateUnreadOnly,
        ]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {bannerNotification ? (
                <Animated.View
                    pointerEvents="box-none"
                    style={[
                        styles.bannerHost,
                        { transform: [{ translateY: bannerTranslateY }] },
                    ]}
                >
                    <Pressable
                        onPress={() => void handleNotificationPress(bannerNotification)}
                        style={({ pressed }) => [
                            styles.bannerCard,
                            pressed && styles.bannerPressed,
                        ]}
                    >
                        <Text style={styles.bannerLabel}>New update</Text>
                        <Text style={styles.bannerTitle} numberOfLines={1}>
                            {bannerNotification.title}
                        </Text>
                        <Text style={styles.bannerBody} numberOfLines={2}>
                            {bannerNotification.body}
                        </Text>
                    </Pressable>
                </Animated.View>
            ) : null}
        </NotificationContext.Provider>
    );
}

const styles = StyleSheet.create({
    bannerHost: {
        position: "absolute",
        top: 58,
        left: 14,
        right: 14,
        zIndex: 50,
    },
    bannerCard: {
        borderRadius: 16,
        backgroundColor: "#0b2457",
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: "#041533",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    bannerPressed: {
        opacity: 0.92,
    },
    bannerLabel: {
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: "#9ec5ff",
        fontWeight: "700",
        marginBottom: 4,
    },
    bannerTitle: {
        fontSize: 14,
        color: "#ffffff",
        fontWeight: "700",
        marginBottom: 3,
    },
    bannerBody: {
        fontSize: 12,
        color: "#d7e6ff",
        lineHeight: 18,
    },
});
