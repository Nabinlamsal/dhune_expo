import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationItem } from "@/types/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const formatDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.valueOf())) return value;

    return parsed.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const getTypeLabel = (type: string) =>
    type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (match) => match.toUpperCase());

function NotificationCard({
    item,
    onPress,
    onMarkRead,
}: {
    item: NotificationItem;
    onPress: () => void;
    onMarkRead: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                !item.is_read && styles.cardUnread,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={[styles.iconWrap, !item.is_read && styles.iconWrapUnread]}>
                <Ionicons
                    name={item.is_read ? "notifications-outline" : "radio-button-on"}
                    size={18}
                    color={item.is_read ? "#0b2457" : "#ebbc01"}
                />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <Text style={styles.typeTag}>{getTypeLabel(item.type)}</Text>
                    <Text style={styles.timestamp}>{formatDateTime(item.created_at)}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.body}</Text>
                <View style={styles.footerRow}>
                    <Text style={styles.entityMeta}>
                        {item.entity_type} {item.entity_id ? "update" : ""}
                    </Text>
                    {!item.is_read ? (
                        <Pressable
                            onPress={onMarkRead}
                            style={({ pressed }) => [
                                styles.markReadBtn,
                                pressed && styles.markReadPressed,
                            ]}
                        >
                            <Text style={styles.markReadText}>Mark read</Text>
                        </Pressable>
                    ) : (
                        <Text style={styles.readState}>Read</Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

export default function NotificationsScreen() {
    const {
        notifications,
        unreadCount,
        unreadOnly,
        isReady,
        isRefreshing,
        isLoadingMore,
        hasMore,
        isSocketConnected,
        refresh,
        loadMore,
        setUnreadOnly,
        markAsRead,
        markAllAsRead,
        handleNotificationPress,
        reconnect,
    } = useNotifications();

    const emptyText = useMemo(() => {
        if (!isReady) return "Loading notifications...";
        if (unreadOnly) return "No unread notifications.";
        return "No notifications yet.";
    }, [isReady, unreadOnly]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <View style={styles.headerCopy}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.headerMeta}>
                        {unreadCount} unread | {isSocketConnected ? "Live" : "Offline"}
                    </Text>
                </View>
                {!isSocketConnected ? (
                    <Pressable
                        onPress={reconnect}
                        style={({ pressed }) => [
                            styles.reconnectBtn,
                            pressed && styles.reconnectPressed,
                        ]}
                    >
                        <Ionicons name="refresh" size={14} color="#0b2457" />
                        <Text style={styles.reconnectText}>Reconnect</Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.toolbar}>
                <Pressable
                    onPress={() => void setUnreadOnly(!unreadOnly)}
                    style={({ pressed }) => [
                        styles.filterChip,
                        unreadOnly && styles.filterChipActive,
                        pressed && styles.filterChipPressed,
                    ]}
                >
                    <Ionicons
                        name={unreadOnly ? "mail-unread" : "mail-open"}
                        size={14}
                        color={unreadOnly ? "#ffffff" : "#0b2457"}
                    />
                    <Text
                        style={[
                            styles.filterText,
                            unreadOnly && styles.filterTextActive,
                        ]}
                    >
                        {unreadOnly ? "Unread only" : "All notifications"}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => void markAllAsRead()}
                    disabled={notifications.length === 0 || unreadCount === 0}
                    style={({ pressed }) => [
                        styles.markAllBtn,
                        (notifications.length === 0 || unreadCount === 0) &&
                        styles.markAllDisabled,
                        pressed && styles.markAllPressed,
                    ]}
                >
                    <Text style={styles.markAllText}>Mark all read</Text>
                </Pressable>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <NotificationCard
                        item={item}
                        onPress={() => void handleNotificationPress(item)}
                        onMarkRead={() => void markAsRead(item)}
                    />
                )}
                contentContainerStyle={[
                    styles.listContent,
                    notifications.length === 0 && styles.emptyContent,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => void refresh({ refreshList: true })}
                        tintColor="#0b2457"
                    />
                }
                onEndReachedThreshold={0.25}
                onEndReached={() => {
                    if (hasMore && !isLoadingMore) {
                        void loadMore();
                    }
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={28} color="#9ca3af" />
                        <Text style={styles.emptyText}>{emptyText}</Text>
                    </View>
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator color="#0b2457" />
                        </View>
                    ) : null
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#edf4ff",
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },
    headerCopy: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#0b2457",
    },
    headerMeta: {
        marginTop: 4,
        fontSize: 12,
        color: "#5b6b86",
        fontWeight: "600",
    },
    reconnectBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#ffffff",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    reconnectPressed: {
        opacity: 0.86,
    },
    reconnectText: {
        fontSize: 12,
        color: "#0b2457",
        fontWeight: "700",
    },
    toolbar: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#ffffff",
        borderColor: "#dbe7ff",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    filterChipActive: {
        backgroundColor: "#0b2457",
        borderColor: "#0b2457",
    },
    filterChipPressed: {
        opacity: 0.88,
    },
    filterText: {
        fontSize: 12,
        color: "#0b2457",
        fontWeight: "700",
    },
    filterTextActive: {
        color: "#ffffff",
    },
    markAllBtn: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#ebbc01",
    },
    markAllDisabled: {
        opacity: 0.45,
    },
    markAllPressed: {
        opacity: 0.88,
    },
    markAllText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#0b2457",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
        gap: 10,
    },
    emptyContent: {
        flexGrow: 1,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        backgroundColor: "#ffffff",
        padding: 12,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    cardUnread: {
        borderColor: "#f2d46b",
        backgroundColor: "#fffdf4",
    },
    cardPressed: {
        opacity: 0.92,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e8f0ff",
    },
    iconWrapUnread: {
        backgroundColor: "#fff4c6",
    },
    cardBody: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 6,
    },
    typeTag: {
        fontSize: 10,
        color: "#1d4ed8",
        fontWeight: "800",
        textTransform: "uppercase",
        flex: 1,
    },
    timestamp: {
        fontSize: 11,
        color: "#64748b",
    },
    title: {
        fontSize: 14,
        fontWeight: "800",
        color: "#111827",
        marginBottom: 4,
    },
    body: {
        fontSize: 12,
        color: "#475569",
        lineHeight: 18,
    },
    footerRow: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    entityMeta: {
        fontSize: 11,
        color: "#64748b",
        textTransform: "capitalize",
        flex: 1,
    },
    markReadBtn: {
        borderRadius: 999,
        backgroundColor: "#0b2457",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    markReadPressed: {
        opacity: 0.88,
    },
    markReadText: {
        fontSize: 11,
        color: "#ffffff",
        fontWeight: "700",
    },
    readState: {
        fontSize: 11,
        color: "#16a34a",
        fontWeight: "700",
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    emptyText: {
        fontSize: 13,
        color: "#94a3b8",
        fontWeight: "600",
    },
    footerLoader: {
        paddingVertical: 18,
    },
});
