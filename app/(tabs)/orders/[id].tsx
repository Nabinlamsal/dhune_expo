import { useOrderDetail } from "@/hooks/orders/useOrder";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type DetailRowProps = {
    label: string;
    value?: string | number | null;
};

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value ?? "-"}</Text>
        </View>
    );
}

const compactId = (prefix: string, value?: string | null) => {
    if (!value) return "-";
    const sum = Array.from(value).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return `${prefix}${(sum % 999) + 1}`;
};

export default function OrderDetailScreen() {
    const { id, ref } = useLocalSearchParams<{ id: string; ref?: string }>();
    const { data: order, isLoading } = useOrderDetail(String(id ?? ""));

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <Text style={styles.centerText}>Loading order details...</Text>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.safe}>
                <Text style={styles.centerText}>Order not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Order Details</Text>

                <View style={styles.section}>
                    <DetailRow label="Order Ref" value={ref ?? compactId("Or", order.id)} />
                    <DetailRow label="Request Ref" value={compactId("Rq", order.request_id)} />
                    <DetailRow label="Status" value={order.order_status} />
                    <DetailRow label="Payment Status" value={order.payment_status} />
                    <DetailRow label="Final Price" value={`Rs ${order.final_price}`} />
                    <DetailRow label="Created At" value={order.created_at} />
                </View>

                <Text style={styles.sectionTitle}>User</Text>
                <View style={styles.section}>
                    <DetailRow label="User Ref" value={compactId("Us", order.user?.id)} />
                    <DetailRow label="Name" value={order.user?.name} />
                    <DetailRow label="Email" value={order.user?.email} />
                    <DetailRow label="Phone" value={order.user?.phone} />
                </View>

                <Text style={styles.sectionTitle}>Vendor</Text>
                <View style={styles.section}>
                    <DetailRow label="Vendor Ref" value={compactId("Vn", order.vendor?.id)} />
                    <DetailRow label="Name" value={order.vendor?.name} />
                    <DetailRow label="Email" value={order.vendor?.email} />
                    <DetailRow label="Phone" value={order.vendor?.phone} />
                </View>

                <Text style={styles.sectionTitle}>Request Snapshot</Text>
                <View style={styles.section}>
                    <DetailRow label="Pickup Address" value={order.request?.pickup_address} />
                    <DetailRow label="Pickup From" value={order.request?.pickup_time_from} />
                    <DetailRow label="Pickup To" value={order.request?.pickup_time_to} />
                    <DetailRow label="Payment Method" value={order.request?.payment_method} />
                    <DetailRow label="Request Status" value={order.request?.status} />
                </View>

                <Text style={styles.sectionTitle}>Services</Text>
                {order.services?.length ? (
                    order.services.map((service, idx) => (
                        <View style={styles.section} key={`${service.category_id}-${idx}`}>
                            <DetailRow label="Category Ref" value={`Ct${idx + 1}`} />
                            <DetailRow label="Category Name" value={service.category_name} />
                            <DetailRow label="Selected Unit" value={service.selected_unit} />
                            <DetailRow label="Quantity" value={service.quantity_value} />
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No services in this order.</Text>
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
        paddingTop: 12,
    },
    centerText: {
        marginTop: 24,
        textAlign: "center",
        color: "#6b7280",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#040947",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        marginVertical: 10,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    detailRow: {
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        color: "#111827",
        fontWeight: "600",
    },
    emptyText: {
        color: "#9ca3af",
        fontSize: 13,
    },
});
