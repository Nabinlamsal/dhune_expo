import { useMyOrders } from "@/hooks/orders/useOrder";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

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
    const { data, isLoading } = useMyOrders(20, 0);
    const orders = data ?? [];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    scroll: {
        padding: 16,
    },
    emptyText: {
        textAlign: "center",
        color: "#6b7280",
        marginTop: 24,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    pressed: {
        opacity: 0.86,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ebbc0115",
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
