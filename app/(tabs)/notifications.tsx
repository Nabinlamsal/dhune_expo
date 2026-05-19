import { useAppTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationItem } from "@/types/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

const formatDateTime = (value: string, locale: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.valueOf())) return value;

    return parsed.toLocaleString(locale, {
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
    const { theme } = useAppTheme();
    const { t, i18n } = useTranslation();
    const locale = i18n.language === "np" ? "ne-NP" : "en-US";
    const typeLabel = t(`notifications.types.${item.type}`, { defaultValue: getTypeLabel(item.type) });
    const entityLabel = item.entity_id
        ? t("notifications.entityUpdate", { entity: item.entity_type })
        : item.entity_type;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    backgroundColor: item.is_read ? theme.card : theme.mode === "dark" ? theme.surfaceMuted : "#fffdf4",
                    borderColor: item.is_read ? theme.border : theme.accent,
                },
                pressed && styles.cardPressed,
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: item.is_read ? theme.primarySoft : theme.accentSoft }]}>
                <Ionicons
                    name={item.is_read ? "notifications-outline" : "radio-button-on"}
                    size={18}
                    color={item.is_read ? theme.primary : theme.accent}
                />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.typeTag, { color: theme.primary }]}>{typeLabel}</Text>
                    <Text style={[styles.timestamp, { color: theme.textMuted }]}>
                        {formatDateTime(item.created_at, locale)}
                    </Text>
                </View>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.body, { color: theme.textMuted }]}>{item.body}</Text>
                <View style={styles.footerRow}>
                    <Text style={[styles.entityMeta, { color: theme.textMuted }]}>
                        {entityLabel}
                    </Text>
                    {!item.is_read ? (
                        <Pressable
                            onPress={onMarkRead}
                            style={({ pressed }) => [
                                styles.markReadBtn,
                                { backgroundColor: theme.primary },
                                pressed && styles.markReadPressed,
                            ]}
                        >
                            <Text style={styles.markReadText}>{t("notifications.markRead")}</Text>
                        </Pressable>
                    ) : (
                        <Text style={[styles.readState, { color: theme.success }]}>{t("notifications.read")}</Text>
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
    const { theme } = useAppTheme();
    const { t } = useTranslation();

    const emptyText = useMemo(() => {
        if (!isReady) return t("notifications.loading");
        if (unreadOnly) return t("notifications.noUnread");
        return t("notifications.noNotifications");
    }, [isReady, t, unreadOnly]);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.headerCopy}>
                    <Text style={[styles.headerTitle, { color: theme.primary }]}>{t("notifications.title")}</Text>
                    <Text style={[styles.headerMeta, { color: theme.textMuted }]}>
                        {t("notifications.unreadCount", { count: unreadCount })} |{" "}
                        {isSocketConnected ? t("notifications.live") : t("notifications.offline")}
                    </Text>
                </View>
                {!isSocketConnected ? (
                    <Pressable
                        onPress={reconnect}
                        style={({ pressed }) => [
                            styles.reconnectBtn,
                            { backgroundColor: theme.card, borderColor: theme.border },
                            pressed && styles.reconnectPressed,
                        ]}
                    >
                        <Ionicons name="refresh" size={14} color={theme.primary} />
                        <Text style={[styles.reconnectText, { color: theme.primary }]}>
                            {t("notifications.reconnect")}
                        </Text>
                    </Pressable>
                ) : null}
            </View>

            <View style={styles.toolbar}>
                <Pressable
                    onPress={() => void setUnreadOnly(!unreadOnly)}
                    style={({ pressed }) => [
                        styles.filterChip,
                        { backgroundColor: theme.card, borderColor: theme.border },
                        unreadOnly && { backgroundColor: theme.primary, borderColor: theme.primary },
                        pressed && styles.filterChipPressed,
                    ]}
                >
                    <Ionicons
                        name={unreadOnly ? "mail-unread" : "mail-open"}
                        size={14}
                        color={unreadOnly ? theme.primaryContrast : theme.primary}
                    />
                    <Text
                        style={[
                            styles.filterText,
                            { color: unreadOnly ? theme.primaryContrast : theme.primary },
                        ]}
                    >
                        {unreadOnly ? t("notifications.unreadOnly") : t("notifications.allNotifications")}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => void markAllAsRead()}
                    disabled={notifications.length === 0 || unreadCount === 0}
                    style={({ pressed }) => [
                        styles.markAllBtn,
                        { backgroundColor: theme.accent },
                        (notifications.length === 0 || unreadCount === 0) &&
                        styles.markAllDisabled,
                        pressed && styles.markAllPressed,
                    ]}
                >
                    <Text style={styles.markAllText}>{t("notifications.markAllRead")}</Text>
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
                        tintColor={theme.primary}
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
                        <Ionicons name="notifications-off-outline" size={28} color={theme.textSoft} />
                        <Text style={[styles.emptyText, { color: theme.textSoft }]}>{emptyText}</Text>
                    </View>
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <View style={styles.footerLoader}>
                            <ActivityIndicator color={theme.primary} />
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
        flexWrap: "wrap",
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
        flexShrink: 1,
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
        flexShrink: 1,
    },
    filterTextActive: {
        color: "#ffffff",
    },
    markAllBtn: {
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#ebbc01",
        flexShrink: 1,
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
        textAlign: "center",
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
        textAlign: "center",
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
