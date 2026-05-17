import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useMyOrders } from "@/hooks/orders/useOrder";
import { formatDate, formatMoney } from "@/utils/formatters";
import { formatStatusLabel, getOrderStatusColor } from "@/utils/statusHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const PAGE_SIZE = 10;

const getOrderCategoryLabel = (order: any) => {
    if (Array.isArray(order?.services) && order.services.length > 0) {
        const firstCategory = order.services[0]?.category_name;
        if (firstCategory) return firstCategory;
    }
    return order?.pickup_address ?? "Laundry Order";
};

export default function OrdersScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const [page, setPage] = useState(0);
    const offset = page * PAGE_SIZE;
    const { data, isLoading, isFetching } = useMyOrders(PAGE_SIZE, offset);
    const orders = data ?? [];
    const canGoBack = page > 0;
    const canGoNext = orders.length === PAGE_SIZE;
    const shouldShowPagination = canGoBack || canGoNext;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Orders"
                    subtitle="Follow active deliveries and completed drops."
                />

                {isLoading ? (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>Loading orders...</Text>
                ) : orders.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No orders found.</Text>
                ) : (
                    orders.map((order, index) => {
                        const color = getOrderStatusColor(order.order_status);
                        const orderRef = `Or${index + 1}`;
                        return (
                            <Pressable
                                key={order.id}
                                style={({ pressed }) => [
                                    styles.card,
                                    { backgroundColor: theme.card, borderColor: theme.border },
                                    pressed && styles.pressed,
                                ]}
                                onPress={() =>
                                    router.push(`/orders/${order.id}?ref=${encodeURIComponent(orderRef)}` as any)
                                }
                            >
                                <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
                                    <Ionicons name="bag-handle-outline" size={18} color={theme.primary} />
                                </View>
                                <View style={styles.body}>
                                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                                        {getOrderCategoryLabel(order)}
                                    </Text>
                                    <Text style={[styles.meta, { color: theme.textSoft }]}>
                                        {orderRef} - {formatDate(order.created_at)} - {formatMoney(order.final_price)}
                                    </Text>
                                </View>
                                <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
                                    <Text style={[styles.pillText, { color }]}>
                                        {formatStatusLabel(order.order_status)}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })
                )}

                {!isLoading && orders.length > 0 && shouldShowPagination ? (
                    <View style={styles.paginationFooter}>
                        <Pressable
                            disabled={!canGoBack || isFetching}
                            onPress={() => setPage((current) => Math.max(0, current - 1))}
                            style={({ pressed }) => [
                                styles.pageBtn,
                                { backgroundColor: theme.card, borderColor: theme.border },
                                pressed && styles.pressed,
                                (!canGoBack || isFetching) && styles.disabled,
                            ]}
                        >
                            <Text style={[styles.pageBtnText, { color: theme.text }]}>Previous</Text>
                        </Pressable>
                        <Text style={[styles.paginationText, { color: theme.textMuted }]}>
                            Page {page + 1}
                            {isFetching ? " ..." : ""}
                        </Text>
                        <Pressable
                            disabled={!canGoNext || isFetching}
                            onPress={() => setPage((current) => current + 1)}
                            style={({ pressed }) => [
                                styles.pageBtn,
                                { backgroundColor: theme.card, borderColor: theme.border },
                                pressed && styles.pressed,
                                (!canGoNext || isFetching) && styles.disabled,
                            ]}
                        >
                            <Text style={[styles.pageBtnText, { color: theme.text }]}>Next</Text>
                        </Pressable>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    scroll: {
        padding: 16,
    },
    paginationFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginTop: 6,
    },
    pageBtn: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderWidth: 1,
    },
    pageBtnText: {
        fontSize: 13,
        fontWeight: "700",
    },
    paginationText: {
        minWidth: 68,
        textAlign: "center",
        fontSize: 13,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 24,
        fontSize: 15,
        fontWeight: "600",
    },
    card: {
        borderRadius: 16,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
    },
    pressed: {
        opacity: 0.86,
    },
    disabled: {
        opacity: 0.5,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    body: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    meta: {
        marginTop: 2,
        fontSize: 13,
    },
    pill: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pillText: {
        fontSize: 11,
        fontWeight: "700",
    },
});

