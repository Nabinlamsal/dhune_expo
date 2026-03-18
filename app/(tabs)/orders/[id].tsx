import { useOrderDetail } from "@/hooks/orders/useOrder";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

type DetailRowProps = {
    label: string;
    value?: string | number | null;
    icon: keyof typeof Ionicons.glyphMap;
};

function DetailRow({ label, value, icon }: DetailRowProps) {
    return (
        <View style={styles.detailRow}>
            <View style={styles.detailLabelWrap}>
                <Ionicons name={icon} size={12} color="#64748b" />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={3}>
                {value ?? "-"}
            </Text>
        </View>
    );
}

const compactId = (prefix: string, value?: string | null) => {
    if (!value) return "-";
    const sum = Array.from(value).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return `${prefix}${(sum % 999) + 1}`;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
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
                <View style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>Order Details</Text>
                        <View style={styles.statusPill}>
                            <Text style={styles.statusText}>{order.order_status ?? "Unknown"}</Text>
                        </View>
                    </View>
                    <View style={styles.heroMetaRow}>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="bag-check-outline" size={12} color="#0f172a" />
                            <Text style={styles.heroMetaText}>{ref ?? compactId("Or", order.id)}</Text>
                        </View>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="cash-outline" size={12} color="#0f172a" />
                            <Text style={styles.heroMetaText}>{`Rs ${order.final_price}`}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.section}>
                    <DetailRow label="Order Ref" value={ref ?? compactId("Or", order.id)} icon="document-text-outline" />
                    <DetailRow label="Request Ref" value={compactId("Rq", order.request_id)} icon="git-merge-outline" />
                    <DetailRow label="Payment Status" value={order.payment_status} icon="wallet-outline" />
                    <DetailRow label="Created At" value={formatDateTime(order.created_at)} icon="calendar-outline" />
                </View>

                <Text style={styles.sectionTitle}>User</Text>
                <View style={styles.section}>
                    <DetailRow label="User Ref" value={compactId("Us", order.user?.id)} icon="person-outline" />
                    <DetailRow label="Name" value={order.user?.name} icon="id-card-outline" />
                    <DetailRow label="Email" value={order.user?.email} icon="mail-outline" />
                    <DetailRow label="Phone" value={order.user?.phone} icon="call-outline" />
                </View>

                <Text style={styles.sectionTitle}>Vendor</Text>
                <View style={styles.section}>
                    <DetailRow label="Vendor Ref" value={compactId("Vn", order.vendor?.id)} icon="storefront-outline" />
                    <DetailRow label="Name" value={order.vendor?.name} icon="person-circle-outline" />
                    <DetailRow label="Email" value={order.vendor?.email} icon="mail-outline" />
                    <DetailRow label="Phone" value={order.vendor?.phone} icon="call-outline" />
                </View>

                <Text style={styles.sectionTitle}>Request Snapshot</Text>
                <View style={styles.section}>
                    <DetailRow label="Pickup Address" value={order.request?.pickup_address} icon="location-outline" />
                    <DetailRow label="Pickup Latitude" value={order.request?.pickup_lat} icon="navigate-outline" />
                    <DetailRow label="Pickup Longitude" value={order.request?.pickup_lng} icon="navigate-outline" />
                    <DetailRow label="Pickup From" value={formatDateTime(order.request?.pickup_time_from)} icon="time-outline" />
                    <DetailRow label="Pickup To" value={formatDateTime(order.request?.pickup_time_to)} icon="time-outline" />
                    <DetailRow label="Payment Method" value={order.request?.payment_method} icon="card-outline" />
                    <DetailRow label="Request Status" value={order.request?.status} icon="pulse-outline" />
                </View>

                <Text style={styles.sectionTitle}>Services</Text>
                {order.services?.length ? (
                    order.services.map((service, idx) => (
                        <View style={styles.section} key={`${service.category_id}-${idx}`}>
                            <View style={styles.serviceTitleRow}>
                                <Ionicons name="construct-outline" size={14} color="#0f172a" />
                                <Text style={styles.serviceTitle}>Service {idx + 1}</Text>
                            </View>
                            <DetailRow label="Category Ref" value={`Ct${idx + 1}`} icon="pricetag-outline" />
                            <DetailRow label="Category Name" value={service.category_name} icon="grid-outline" />
                            <DetailRow label="Selected Unit" value={service.selected_unit} icon="cube-outline" />
                            <DetailRow label="Quantity" value={service.quantity_value} icon="layers-outline" />
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
    heroCard: {
        backgroundColor: "#ecfeff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#bae6fd",
        padding: 12,
        marginBottom: 12,
    },
    heroTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    statusPill: {
        backgroundColor: "#dbeafe",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#1e3a8a",
        textTransform: "capitalize",
    },
    heroMetaRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    heroMetaChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#ffffff",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    heroMetaText: {
        fontSize: 11,
        color: "#1e293b",
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0f172a",
        marginVertical: 10,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 12,
        marginBottom: 10,
        shadowColor: "#0f172a",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    detailRow: {
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    detailLabelWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 3,
    },
    detailLabel: {
        fontSize: 11,
        color: "#64748b",
    },
    detailValue: {
        fontSize: 13,
        color: "#0f172a",
        fontWeight: "600",
    },
    serviceTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1e293b",
    },
    emptyText: {
        color: "#9ca3af",
        fontSize: 12,
    },
});
