import ScreenHeader from "@/components/ui/ScreenHeader";
import { useMyOrders } from "@/hooks/orders/useOrder";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const PAGE_SIZE = 10;

const STATUS_COLORS: Record<string, string> = {
    ACCEPTED: "#ebbc01",
    PICKED_UP: "#f97316",
    IN_PROGRESS: "#3b82f6",
    DELIVERING: "#8b5cf6",
    COMPLETED: "#22c55e",
    CANCELLED: "#ef4444",
};

const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatStatus = (s: string) => s.replace(/_/g, " ");

const getOrderCategoryLabel = (order: any) => {
    if (Array.isArray(order?.services) && order.services.length > 0) {
        const firstCategory = order.services[0]?.category_name;
        if (firstCategory) return firstCategory;
    }
    return order?.pickup_address ?? "Laundry Order";
};

export default function OrdersScreen() {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const offset = page * PAGE_SIZE;
    const { data, isLoading, isFetching } = useMyOrders(PAGE_SIZE, offset);
    const orders = data ?? [];
    const canGoBack = page > 0;
    const canGoNext = orders.length === PAGE_SIZE;

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Orders"
                    subtitle="Follow active deliveries and completed drops."
                />

                {isLoading ? (
                    <Text style={styles.emptyText}>Loading orders...</Text>
                ) : orders.length === 0 ? (
                    <Text style={styles.emptyText}>No orders found.</Text>
                ) : (
                    orders.map((order, index) => {
                        const color = STATUS_COLORS[order.order_status] ?? "#9ca3af";
                        const orderRef = `Or${index + 1}`;
                        return (
                            <Pressable
                                key={order.id}
                                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                                onPress={() =>
                                    router.push(`/orders/${order.id}?ref=${encodeURIComponent(orderRef)}` as any)
                                }
                            >
                                <View style={styles.iconWrap}>
                                    <Ionicons name="bag-handle-outline" size={18} color="#040947" />
                                </View>
                                <View style={styles.body}>
                                    <Text style={styles.title} numberOfLines={1}>
                                        {getOrderCategoryLabel(order)}
                                    </Text>
                                    <Text style={styles.meta}>
                                        {orderRef} · {formatDate(order.created_at)} · Rs {order.final_price}
                                    </Text>
                                </View>
                                <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
                                    <Text style={[styles.pillText, { color }]}>
                                        {formatStatus(order.order_status)}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })
                )}

                {!isLoading && orders.length > 0 ? (
                    <View style={styles.paginationFooter}>
                        <Pressable
                            disabled={!canGoBack || isFetching}
                            onPress={() => setPage((current) => Math.max(0, current - 1))}
                            style={({ pressed }) => [
                                styles.pageBtn,
                                pressed && styles.pressed,
                                (!canGoBack || isFetching) && styles.disabled,
                            ]}
                        >
                            <Text style={styles.pageBtnText}>Previous</Text>
                        </Pressable>
                        <Text style={styles.paginationText}>
                            Page {page + 1}
                            {isFetching ? " ..." : ""}
                        </Text>
                        <Pressable
                            disabled={!canGoNext || isFetching}
                            onPress={() => setPage((current) => current + 1)}
                            style={({ pressed }) => [
                                styles.pageBtn,
                                pressed && styles.pressed,
                                (!canGoNext || isFetching) && styles.disabled,
                            ]}
                        >
                            <Text style={styles.pageBtnText}>Next</Text>
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
        backgroundColor: "#edf4ff",
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
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
    },
    pageBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#334155",
    },
    paginationText: {
        minWidth: 68,
        textAlign: "center",
        fontSize: 12,
        color: "#6b7280",
    },
    emptyText: {
        textAlign: "center",
        color: "#6b7280",
        marginTop: 24,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#dbe7ff",
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
        backgroundColor: "#e8f0ff",
    },
    body: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
    },
    meta: {
        marginTop: 2,
        fontSize: 12,
        color: "#9ca3af",
    },
    pill: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pillText: {
        fontSize: 10,
        fontWeight: "700",
    },
});
