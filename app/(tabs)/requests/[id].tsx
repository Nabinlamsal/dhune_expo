import OfferBidCard from "@/components/offers/OfferBidCard";
import { useAcceptOffer, useOffersByRequest, useRejectOffer } from "@/hooks/orders/useOffer";
import { useRequestDetail } from "@/hooks/orders/useRequest";
import { Offer } from "@/types/orders/offers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

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

const getBestPriceOfferId = (offers: Offer[]) => {
    const pending = offers.filter((offer) => offer.status === "PENDING");
    if (!pending.length) return null;

    return pending.reduce((best, current) => (current.bid_price < best.bid_price ? current : best)).id;
};

const getFastestOfferId = (offers: Offer[]) => {
    const pending = offers.filter((offer) => offer.status === "PENDING");
    if (!pending.length) return null;

    return pending.reduce((best, current) => {
        const currentDate = new Date(current.completion_time).valueOf();
        const bestDate = new Date(best.completion_time).valueOf();

        if (Number.isNaN(currentDate)) return best;
        if (Number.isNaN(bestDate)) return current;
        return currentDate < bestDate ? current : best;
    }).id;
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

export default function RequestDetailScreen() {
    const router = useRouter();
    const { id, ref } = useLocalSearchParams<{ id: string; ref?: string }>();
    const requestId = String(id ?? "");

    const { data, isLoading } = useRequestDetail(requestId);
    const { data: offersResponse, isLoading: offersLoading } = useOffersByRequest(requestId);
    const acceptOfferMutation = useAcceptOffer();
    const rejectOfferMutation = useRejectOffer();

    const request = data?.data;
    const offers = offersResponse?.data ?? [];
    const pendingOffers = offers.filter((offer) => offer.status === "PENDING");
    const bestPriceOfferId = getBestPriceOfferId(offers);
    const fastestOfferId = getFastestOfferId(offers);

    const handleAccept = (offerId: string) => {
        Alert.alert("Accept this offer?", "This will create the order and close remaining offers.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Accept",
                style: "default",
                onPress: () => {
                    acceptOfferMutation.mutate(
                        { offer_id: offerId },
                        {
                            onSuccess: (response) => {
                                const orderId = response.data?.order_id;
                                Alert.alert("Offer accepted", "Order created successfully.");
                                if (orderId) {
                                    router.replace(`/orders/${orderId}` as any);
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
    };

    const handleReject = (offerId: string) => {
        Alert.alert("Reject this offer?", "You can still choose from other bids.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reject",
                style: "destructive",
                onPress: () => {
                    rejectOfferMutation.mutate(
                        { offer_id: offerId },
                        {
                            onError: () => {
                                Alert.alert("Could not reject", "Please try again.");
                            },
                        }
                    );
                },
            },
        ]);
    };

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
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>Request Details</Text>
                        <View style={styles.statusPill}>
                            <Text style={styles.statusText}>{request.status ?? "Unknown"}</Text>
                        </View>
                    </View>
                    <View style={styles.heroMetaRow}>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="document-text-outline" size={12} color="#0f172a" />
                            <Text style={styles.heroMetaText}>{ref ?? compactId("Rq", request.id)}</Text>
                        </View>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="wallet-outline" size={12} color="#0f172a" />
                            <Text style={styles.heroMetaText}>{request.payment_method ?? "-"}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Pickup Details</Text>
                <View style={styles.section}>
                    <DetailRow label="Pickup Address" value={request.pickup_address} icon="location-outline" />
                    <DetailRow label="Pickup Latitude" value={request.pickup_lat} icon="navigate-outline" />
                    <DetailRow label="Pickup Longitude" value={request.pickup_lng} icon="navigate-outline" />
                    <DetailRow label="Pickup From" value={formatDateTime(request.pickup_time_from)} icon="time-outline" />
                    <DetailRow label="Pickup To" value={formatDateTime(request.pickup_time_to)} icon="time-outline" />
                    <DetailRow label="Created At" value={formatDateTime(request.created_at)} icon="calendar-outline" />
                </View>

                <Text style={styles.sectionTitle}>Vendor Offers</Text>
                {offersLoading ? (
                    <Text style={styles.emptyText}>Loading bids...</Text>
                ) : pendingOffers.length ? (
                    <View style={styles.offerStack}>
                        {pendingOffers.map((offer) => {
                            const highlight =
                                offer.id === bestPriceOfferId
                                    ? "best_price"
                                    : offer.id === fastestOfferId
                                        ? "fastest"
                                        : null;

                            return (
                                <OfferBidCard
                                    key={offer.id}
                                    offer={offer}
                                    highlight={highlight}
                                    onAccept={() => handleAccept(offer.id)}
                                    onReject={() => handleReject(offer.id)}
                                    isAccepting={acceptOfferMutation.isPending && acceptOfferMutation.variables?.offer_id === offer.id}
                                    isRejecting={rejectOfferMutation.isPending && rejectOfferMutation.variables?.offer_id === offer.id}
                                />
                            );
                        })}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>No active offers yet. Vendors will appear here once they bid.</Text>
                )}

                <Text style={styles.sectionTitle}>Services</Text>
                {request.services?.length ? (
                    request.services.map((service, idx) => (
                        <View style={styles.section} key={`${service.category_id}-${idx}`}>
                            <View style={styles.serviceTitleRow}>
                                <Ionicons name="construct-outline" size={14} color="#0f172a" />
                                <Text style={styles.serviceTitle}>Service {idx + 1}</Text>
                            </View>
                            <DetailRow label="Category Ref" value={`Ct${idx + 1}`} icon="pricetag-outline" />
                            <DetailRow label="Selected Unit" value={service.selected_unit} icon="cube-outline" />
                            <DetailRow label="Quantity" value={service.quantity_value} icon="layers-outline" />
                            <DetailRow label="Description" value={service.description ?? "-"} icon="reader-outline" />
                            <DetailRow
                                label="Items JSON"
                                value={
                                    service.items_json != null
                                        ? JSON.stringify(service.items_json)
                                        : "-"
                                }
                                icon="code-slash-outline"
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
    scroll: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 32,
    },
    centerText: {
        marginTop: 24,
        textAlign: "center",
        color: "#6b7280",
    },
    heroCard: {
        backgroundColor: "#eef2ff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#dbeafe",
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
        backgroundColor: "#dcfce7",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#14532d",
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
    offerStack: {
        gap: 10,
        marginBottom: 4,
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
        marginBottom: 10,
    },
});
