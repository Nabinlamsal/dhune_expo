import { useOrderDetail } from "@/hooks/orders/useOrder";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#0b2457";
const PRIMARY_ACCENT = "#6ee7d8";
const SECTION_BG = "#f7fbff";
const SECTION_BORDER = "#d7e4ff";
const SURFACE_BG = "#eaf2ff";
const MUTED = "#5b6b86";

type DetailRowProps = {
    label: string;
    value?: string | number | null;
    icon: keyof typeof Ionicons.glyphMap;
};

function DetailRow({ label, value, icon }: DetailRowProps) {
    return (
        <View style={styles.detailRow}>
            <View style={styles.detailLabelWrap}>
                <Ionicons name={icon} size={12} color={PRIMARY} />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue} numberOfLines={2}>
                {value ?? "-"}
            </Text>
        </View>
    );
}

function SectionCard({ children }: { children: ReactNode }) {
    return (
        <View style={styles.section}>
            <View style={styles.sectionGloss} />
            {children}
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

    const pickupFrom = formatDateTime(order?.request?.pickup_time_from);
    const pickupTo = formatDateTime(order?.request?.pickup_time_to);
    const pickupCoords =
        order?.request?.pickup_lat != null && order?.request?.pickup_lng != null
            ? `${order.request.pickup_lat}, ${order.request.pickup_lng}`
            : "-";

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
                            <Ionicons name="bag-check-outline" size={12} color="#ffffff" />
                            <Text style={styles.heroMetaText}>{ref ?? compactId("Or", order.id)}</Text>
                        </View>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="cash-outline" size={12} color={PRIMARY_ACCENT} />
                            <Text style={styles.heroMetaText}>{`Rs ${order.final_price}`}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Order Summary</Text>
                <SectionCard>
                    <DetailRow label="Order Ref" value={ref ?? compactId("Or", order.id)} icon="document-text-outline" />
                    <DetailRow label="Request Ref" value={compactId("Rq", order.request_id)} icon="git-merge-outline" />
                    <DetailRow label="Payment Status" value={order.payment_status} icon="wallet-outline" />
                    <DetailRow label="Created" value={formatDateTime(order.created_at)} icon="calendar-outline" />
                </SectionCard>

                <Text style={styles.sectionTitle}>Vendor</Text>
                <SectionCard>
                    <DetailRow label="Vendor Ref" value={compactId("Vn", order.vendor?.id)} icon="storefront-outline" />
                    <DetailRow label="Name" value={order.vendor?.name} icon="person-circle-outline" />
                    <DetailRow label="Email" value={order.vendor?.email} icon="mail-outline" />
                    <DetailRow label="Phone" value={order.vendor?.phone} icon="call-outline" />
                </SectionCard>

                <Text style={styles.sectionTitle}>Pickup Window</Text>
                <SectionCard>
                    <View style={styles.windowRow}>
                        <View style={styles.windowCol}>
                            <Text style={styles.windowLabel}>From</Text>
                            <Text style={styles.windowValue}>{pickupFrom}</Text>
                        </View>
                        <View style={styles.windowDivider} />
                        <View style={styles.windowCol}>
                            <Text style={styles.windowLabel}>To</Text>
                            <Text style={styles.windowValue}>{pickupTo}</Text>
                        </View>
                    </View>
                </SectionCard>

                <Text style={styles.sectionTitle}>Request Snapshot</Text>
                <SectionCard>
                    <DetailRow label="Address" value={order.request?.pickup_address} icon="location-outline" />
                    <DetailRow label="Coordinates" value={pickupCoords} icon="navigate-outline" />
                    <DetailRow label="Payment Method" value={order.request?.payment_method} icon="card-outline" />
                    <DetailRow label="Request Status" value={order.request?.status} icon="pulse-outline" />
                </SectionCard>

                <Text style={styles.sectionTitle}>Services</Text>
                {order.services?.length ? (
                    order.services.map((service, idx) => (
                        <SectionCard key={`${service.category_id}-${idx}`}>
                            <View style={styles.serviceTitleRow}>
                                <Ionicons name="construct-outline" size={14} color={PRIMARY} />
                                <Text style={styles.serviceTitle}>Service {idx + 1}</Text>
                            </View>
                            <DetailRow label="Category" value={`Ct${idx + 1}`} icon="pricetag-outline" />
                            <DetailRow label="Name" value={service.category_name} icon="grid-outline" />
                            <DetailRow label="Unit" value={service.selected_unit} icon="cube-outline" />
                            <DetailRow label="Quantity" value={service.quantity_value} icon="layers-outline" />
                        </SectionCard>
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
        backgroundColor: SURFACE_BG,
    },
    scroll: {
        padding: 16,
        paddingTop: 12,
    },
    centerText: {
        marginTop: 24,
        textAlign: "center",
        color: MUTED,
    },
    heroCard: {
        backgroundColor: PRIMARY,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#264286",
        padding: 14,
        marginBottom: 12,
        shadowColor: "#132f6f",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
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
        color: "#ffffff",
    },
    statusPill: {
        backgroundColor: PRIMARY_ACCENT,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#073b3a",
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
        backgroundColor: "#16377a",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#3157a9",
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    heroMetaText: {
        fontSize: 11,
        color: "#ffffff",
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: PRIMARY,
        marginVertical: 8,
    },
    section: {
        backgroundColor: SECTION_BG,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: SECTION_BORDER,
        padding: 12,
        marginBottom: 10,
        shadowColor: "#173b82",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        overflow: "hidden",
        position: "relative",
    },
    sectionGloss: {
        position: "absolute",
        top: -10,
        left: -18,
        right: -18,
        height: 24,
        backgroundColor: "#ffffffb8",
        transform: [{ rotate: "-2deg" }],
    },
    windowRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    windowCol: {
        flex: 1,
    },
    windowDivider: {
        width: 1,
        backgroundColor: "#c7d8f8",
        marginHorizontal: 10,
        height: 34,
    },
    windowLabel: {
        fontSize: 11,
        color: MUTED,
        marginBottom: 2,
        fontWeight: "600",
    },
    windowValue: {
        fontSize: 12,
        color: PRIMARY,
        fontWeight: "700",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e4edff",
        gap: 10,
    },
    detailLabelWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 0.95,
    },
    detailLabel: {
        fontSize: 11,
        color: MUTED,
    },
    detailValue: {
        flex: 1.35,
        textAlign: "right",
        fontSize: 12,
        color: PRIMARY,
        fontWeight: "700",
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
        color: PRIMARY,
    },
    emptyText: {
        color: MUTED,
        fontSize: 12,
    },
});
