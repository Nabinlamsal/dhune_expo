import { useMyRequests } from "@/hooks/orders/useRequest";
import { RequestStatus } from "@/types/orders/orders-enums";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const REQUEST_STATUS_COLOR: Record<RequestStatus, string> = {
    OPEN: "#ebbc01",
    ORDER_CREATED: "#22c55e",
    CANCELLED: "#ef4444",
    EXPIRED: "#9ca3af",
};

const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatStatus = (s: string) => s.replace(/_/g, " ");

const getCategoryLabel = (request: any) => {
    const firstService = request?.services?.[0];
    if (firstService?.category_name) return firstService.category_name;
    if (typeof request?.category_name === "string") return request.category_name;
    if (Array.isArray(request?.category_names) && request.category_names.length > 0) {
        return String(request.category_names[0]);
    }
    return request?.pickup_address ?? "Request";
};

export default function RequestsScreen() {
    const router = useRouter();
    const { data, isLoading } = useMyRequests(20, 0);
    const requests = data?.data ?? [];

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <Text style={styles.emptyText}>Loading requests...</Text>
                ) : requests.length === 0 ? (
                    <Text style={styles.emptyText}>No requests found.</Text>
                ) : (
                    requests.map((req: any, index) => {
                        const statusColor = REQUEST_STATUS_COLOR[req.status as RequestStatus] ?? "#9ca3af";
                        const requestRef = `Rq${index + 1}`;
                        return (
                            <Pressable
                                key={String(req.id)}
                                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                                onPress={() =>
                                    router.push(`/requests/${req.id}?ref=${encodeURIComponent(requestRef)}` as any)
                                }
                            >
                                <View style={styles.iconWrap}>
                                    <Ionicons name="shirt-outline" size={18} color="#040947" />
                                </View>
                                <View style={styles.body}>
                                    <Text style={styles.title} numberOfLines={1}>
                                        {getCategoryLabel(req)}
                                    </Text>
                                    <Text style={styles.meta}>
                                        {requestRef} · {formatDate(req.created_at)}
                                    </Text>
                                </View>
                                <View style={[styles.pill, { backgroundColor: `${statusColor}22` }]}>
                                    <Text style={[styles.pillText, { color: statusColor }]}>
                                        {formatStatus(String(req.status ?? ""))}
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
