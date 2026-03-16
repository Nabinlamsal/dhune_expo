import IncomingOfferPopup from "@/components/offers/IncomingOfferPopup";
import { useAcceptOffer, useRejectOffer } from "@/hooks/orders/useOffer";
import { useMyOrderStats, useMyOrders } from "@/hooks/orders/useOrder";
import { useMyRequestStats, useMyRequests } from "@/hooks/orders/useRequest";
import { getOffersByRequest } from "@/services/orders/offer_service";
import { RequestStatus } from "@/types/orders/orders-enums";
import { Offer } from "@/types/orders/offers";
import { Ionicons } from "@expo/vector-icons";
import { useQueries } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const REQUEST_STATUS_COLOR: Record<RequestStatus, string> = {
    OPEN: "#ebbc01",
    ORDER_CREATED: "#22c55e",
    CANCELLED: "#ef4444",
    EXPIRED: "#9ca3af",
};

const ORDER_STATUS_COLOR: Record<string, string> = {
    ACCEPTED: "#ebbc01",
    PICKED_UP: "#f97316",
    IN_PROGRESS: "#3b82f6",
    DELIVERING: "#8b5cf6",
    COMPLETED: "#22c55e",
    CANCELLED: "#ef4444",
    ALL: "#9ca3af",
};

const formatStatus = (s: string) => s.replace(/_/g, " ");

const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getRequestCategoryName = (request: any) => {
    const firstService = request?.services?.[0];
    if (firstService?.category_name) return firstService.category_name;
    if (typeof request?.category_name === "string") return request.category_name;
    if (Array.isArray(request?.category_names) && request.category_names.length > 0) {
        return String(request.category_names[0]);
    }
    return request?.pickup_address ?? "Laundry Request";
};

const getOrderCategoryName = (order: any) => {
    if (Array.isArray(order?.services) && order.services.length > 0) {
        const firstCategory = order.services[0]?.category_name;
        if (firstCategory) return firstCategory;
    }
    return order?.pickup_address ?? "Laundry Order";
};

const getEarliestPendingOffer = (offers: Offer[]) => {
    const pendingOffers = offers.filter((offer) => offer.status === "PENDING");
    if (!pendingOffers.length) return null;

    return pendingOffers.reduce((earliest, current) => {
        const earliestTime = new Date(earliest.created_at ?? "").valueOf();
        const currentTime = new Date(current.created_at ?? "").valueOf();

        if (Number.isNaN(earliestTime)) return current;
        if (Number.isNaN(currentTime)) return earliest;
        return currentTime > earliestTime ? current : earliest;
    });
};

function StatCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: number | string;
    icon: keyof typeof Ionicons.glyphMap;
    accent?: boolean;
}) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, accent && styles.statIconAccent]}>
                <Ionicons name={icon} size={16} color={accent ? "#040947" : "#475569"} />
            </View>
            <Text style={styles.statValue}>{value ?? "-"}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function StatusPill({ status, type }: { status: string; type: "request" | "order" }) {
    const color =
        type === "request"
            ? REQUEST_STATUS_COLOR[status as RequestStatus] ?? "#9ca3af"
            : ORDER_STATUS_COLOR[status] ?? "#9ca3af";
    return (
        <View style={[styles.pill, { backgroundColor: `${color}22` }]}>
            <View style={[styles.pillDot, { backgroundColor: color }]} />
            <Text style={[styles.pillText, { color }]}>{formatStatus(status)}</Text>
        </View>
    );
}

function SectionHeader({ title, onPress }: { title: string; onPress?: () => void }) {
    return (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {onPress && (
                <Pressable onPress={onPress}>
                    <Text style={styles.seeAll}>See all</Text>
                </Pressable>
            )}
        </View>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={28} color="#d1d5db" />
            <Text style={styles.emptyText}>{label}</Text>
        </View>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { data: requestStats } = useMyRequestStats();
    const { data: orderStats } = useMyOrderStats();
    const { data: requestsData } = useMyRequests(6, 0);
    const { data: ordersData } = useMyOrders(3, 0);
    const acceptOfferMutation = useAcceptOffer();
    const rejectOfferMutation = useRejectOffer();

    const recentRequests = requestsData?.data?.slice(0, 3) ?? [];
    const openRequests = (requestsData?.data ?? []).filter((req: any) => req.status === "OPEN").slice(0, 4);
    const recentOrders = ordersData?.slice(0, 3) ?? [];

    const offerQueries = useQueries({
        queries: openRequests.map((request: any) => ({
            queryKey: ["offers", "request", String(request.id)],
            queryFn: () => getOffersByRequest(String(request.id)),
        })),
    });

    const incomingOffer = useMemo(() => {
        for (let index = 0; index < openRequests.length; index += 1) {
            const req = openRequests[index];
            const offers = offerQueries[index]?.data?.data ?? [];
            const newest = getEarliestPendingOffer(offers);
            if (newest) {
                return {
                    request: req,
                    offer: newest,
                };
            }
        }
        return null;
    }, [offerQueries, openRequests]);

    const [dismissedOfferId, setDismissedOfferId] = useState<string | null>(null);

    useEffect(() => {
        if (incomingOffer?.offer.id !== dismissedOfferId) {
            return;
        }

        const stillAvailable = openRequests.some((req: any, idx: number) => {
            const offers = offerQueries[idx]?.data?.data ?? [];
            return offers.some((offer) => offer.id === dismissedOfferId && offer.status === "PENDING");
        });

        if (!stillAvailable) {
            setDismissedOfferId(null);
        }
    }, [dismissedOfferId, incomingOffer, offerQueries, openRequests]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    const canShowPopup = Boolean(incomingOffer && incomingOffer.offer.id !== dismissedOfferId);

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={styles.header}>
                        <Text style={styles.greeting}>Good morning</Text>
                        <Text style={styles.brand}>Dhune.np</Text>
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.ctaCard, pressed && { opacity: 0.9 }]}
                        onPress={() => router.push("/(tabs)/requests/create")}
                    >
                        <View style={styles.ctaLeft}>
                            <Text style={styles.ctaLabel}>Ready for laundry?</Text>
                            <Text style={styles.ctaTitle}>Create a Request</Text>
                            <Text style={styles.ctaSub}>Vendors bid, you choose the best offer.</Text>
                        </View>
                        <View style={styles.ctaIconWrap}>
                            <Ionicons name="add-circle" size={42} color="#ebbc01" />
                        </View>
                    </Pressable>

                    <View style={styles.statsGrid}>
                        <StatCard
                            label="Open Requests"
                            value={requestStats?.open_requests ?? 0}
                            icon="file-tray-outline"
                            accent
                        />
                        <StatCard
                            label="Total Requests"
                            value={requestStats?.total_requests ?? 0}
                            icon="document-text-outline"
                        />
                        <StatCard
                            label="Active Orders"
                            value={
                                (orderStats?.data?.accepted_orders ?? 0) +
                                (orderStats?.data?.in_progress_orders ?? 0) +
                                (orderStats?.data?.picked_up_orders ?? 0)
                            }
                            icon="receipt-outline"
                            accent
                        />
                        <StatCard
                            label="Completed"
                            value={orderStats?.data?.completed_orders ?? 0}
                            icon="checkmark-circle-outline"
                        />
                    </View>

                    <SectionHeader title="Recent Requests" onPress={() => router.push("/(tabs)/requests")} />
                    {recentRequests.length === 0 ? (
                        <EmptyState label="No requests yet" />
                    ) : (
                        recentRequests.map((req: any, index) => (
                            <Pressable
                                key={String(req.id)}
                                style={({ pressed }) => [styles.listCard, pressed && styles.listCardPressed]}
                                onPress={() =>
                                    router.push(`/requests/${req.id}?ref=${encodeURIComponent(`Rq${index + 1}`)}` as any)
                                }
                            >
                                <View style={styles.listCardIcon}>
                                    <Ionicons name="shirt-outline" size={20} color="#040947" />
                                </View>
                                <View style={styles.listCardBody}>
                                    <Text style={styles.listCardTitle} numberOfLines={1}>
                                        {getRequestCategoryName(req)}
                                    </Text>
                                    <Text style={styles.listCardMeta}>{formatDate(req.created_at)}</Text>
                                </View>
                                <StatusPill status={String(req.status)} type="request" />
                            </Pressable>
                        ))
                    )}

                    <SectionHeader title="Recent Orders" onPress={() => router.push("/(tabs)/orders")} />
                    {recentOrders.length === 0 ? (
                        <EmptyState label="No orders yet" />
                    ) : (
                        recentOrders.map((order, index) => (
                            <Pressable
                                key={order.id}
                                style={({ pressed }) => [styles.listCard, pressed && styles.listCardPressed]}
                                onPress={() =>
                                    router.push(`/orders/${order.id}?ref=${encodeURIComponent(`Or${index + 1}`)}` as any)
                                }
                            >
                                <View style={styles.listCardIcon}>
                                    <Ionicons name="bag-handle-outline" size={20} color="#040947" />
                                </View>
                                <View style={styles.listCardBody}>
                                    <Text style={styles.listCardTitle} numberOfLines={1}>
                                        {getOrderCategoryName(order)}
                                    </Text>
                                    <Text style={styles.listCardMeta}>
                                        {`Or${index + 1}`} • {formatDate(order.created_at)} •{" "}
                                        <Text style={styles.price}>Rs {order.final_price}</Text>
                                    </Text>
                                </View>
                                <StatusPill status={order.order_status} type="order" />
                            </Pressable>
                        ))
                    )}
                    <View style={{ height: 150 }} />
                </Animated.View>
            </ScrollView>

            {incomingOffer ? (
                <IncomingOfferPopup
                    visible={canShowPopup}
                    requestLabel={getRequestCategoryName(incomingOffer.request)}
                    offer={incomingOffer.offer}
                    isAccepting={acceptOfferMutation.isPending && acceptOfferMutation.variables?.offer_id === incomingOffer.offer.id}
                    isRejecting={rejectOfferMutation.isPending && rejectOfferMutation.variables?.offer_id === incomingOffer.offer.id}
                    onDismiss={() => setDismissedOfferId(incomingOffer.offer.id)}
                    onViewRequest={() =>
                        router.push(`/requests/${incomingOffer.request.id}?ref=${encodeURIComponent("Offer")}` as any)
                    }
                    onAccept={() => {
                        Alert.alert("Accept this offer?", "This creates the order with this vendor.", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Accept",
                                onPress: () => {
                                    acceptOfferMutation.mutate(
                                        { offer_id: incomingOffer.offer.id },
                                        {
                                            onSuccess: (response) => {
                                                const orderId = response.data?.order_id;
                                                setDismissedOfferId(incomingOffer.offer.id);
                                                if (orderId) {
                                                    router.push(`/orders/${orderId}` as any);
                                                }
                                            },
                                            onError: () => {
                                                Alert.alert("Could not accept", "Please try again.");
                                            },
                                        }
                                    );
                                },
                            },
                        ]);
                    }}
                    onReject={() => {
                        Alert.alert("Reject this offer?", "You can still choose another vendor bid.", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Reject",
                                style: "destructive",
                                onPress: () => {
                                    rejectOfferMutation.mutate(
                                        { offer_id: incomingOffer.offer.id },
                                        {
                                            onSuccess: () => {
                                                setDismissedOfferId(incomingOffer.offer.id);
                                            },
                                            onError: () => {
                                                Alert.alert("Could not reject", "Please try again.");
                                            },
                                        }
                                    );
                                },
                            },
                        ]);
                    }}
                />
            ) : null}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    scroll: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    header: {
        marginBottom: 16,
    },
    greeting: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 2,
    },
    brand: {
        fontSize: 24,
        fontWeight: "800",
        color: "#040947",
        letterSpacing: -0.4,
    },
    ctaCard: {
        backgroundColor: "#040947",
        borderRadius: 16,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    ctaLeft: {
        flex: 1,
    },
    ctaLabel: {
        fontSize: 10,
        color: "#ebbc0190",
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 4,
    },
    ctaTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 4,
    },
    ctaSub: {
        fontSize: 12,
        color: "#ffffff90",
        lineHeight: 17,
    },
    ctaIconWrap: {
        marginLeft: 12,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        minWidth: "47%",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 12,
        alignItems: "flex-start",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    statIcon: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    statIconAccent: {
        backgroundColor: "#ebf2ff",
    },
    statValue: {
        fontSize: 19,
        fontWeight: "800",
        color: "#040947",
    },
    statLabel: {
        fontSize: 10,
        color: "#64748b",
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
    },
    seeAll: {
        fontSize: 12,
        color: "#ebbc01",
        fontWeight: "700",
    },
    listCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 9,
    },
    listCardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }],
    },
    listCardIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#ebbc0115",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    listCardBody: {
        flex: 1,
    },
    listCardTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
    },
    listCardMeta: {
        fontSize: 11,
        color: "#9ca3af",
        marginTop: 2,
    },
    price: {
        color: "#040947",
        fontWeight: "700",
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
        marginLeft: 8,
    },
    pillDot: {
        width: 5,
        height: 5,
        borderRadius: 3,
    },
    pillText: {
        fontSize: 9,
        fontWeight: "700",
    },
    emptyState: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        gap: 6,
    },
    emptyText: {
        fontSize: 12,
        color: "#d1d5db",
        fontWeight: "500",
    },
});
