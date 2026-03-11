import NotificationButton from "@/components/ui/NotificationButton";
import { useRequestDetail } from "@/hooks/orders/useRequest";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

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

export default function RequestDetailScreen() {
    const router = useRouter();
    const { id, ref } = useLocalSearchParams<{ id: string; ref?: string }>();
    const { data, isLoading } = useRequestDetail(String(id ?? ""));
    const request = data?.data;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <Text style={styles.centerText}>Loading request details...</Text>
            </SafeAreaView>
        );
    }

    if (!request) {
        return (
            <SafeAreaView style={styles.safe}>
                <Text style={styles.centerText}>Request not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.topBar}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#040947" />
                </Pressable>
                <NotificationButton />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Request Details</Text>

                <View style={styles.section}>
                    <DetailRow label="Request Ref" value={ref ?? compactId("Rq", request.id)} />
                    <DetailRow label="Status" value={request.status} />
                    <DetailRow label="Payment Method" value={request.payment_method} />
                    <DetailRow label="Pickup Address" value={request.pickup_address} />
                    <DetailRow label="Pickup From" value={request.pickup_time_from} />
                    <DetailRow label="Pickup To" value={request.pickup_time_to} />
                    <DetailRow label="Created At" value={request.created_at} />
                </View>

                <Text style={styles.sectionTitle}>Services</Text>
                {request.services?.length ? (
                    request.services.map((service, idx) => (
                        <View style={styles.section} key={`${service.category_id}-${idx}`}>
                            <DetailRow label="Category Ref" value={`Ct${idx + 1}`} />
                            <DetailRow label="Selected Unit" value={service.selected_unit} />
                            <DetailRow label="Quantity" value={service.quantity_value} />
                            <DetailRow label="Description" value={service.description ?? "-"} />
                            <DetailRow
                                label="Items JSON"
                                value={
                                    service.items_json != null
                                        ? JSON.stringify(service.items_json)
                                        : "-"
                                }
                            />
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No services in this request.</Text>
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
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: {
        padding: 16,
        paddingTop: 8,
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
