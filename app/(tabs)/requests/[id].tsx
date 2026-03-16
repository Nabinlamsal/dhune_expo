import OfferBidCard from "@/components/offers/OfferBidCard";
import { useAcceptOffer, useOffersByRequest, useRejectOffer } from "@/hooks/orders/useOffer";
import { useRequestDetail } from "@/hooks/orders/useRequest";
import { Offer } from "@/types/orders/offers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

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
                <Text style={styles.title}>Request Details</Text>

                <View style={styles.section}>
                    <DetailRow label="Request Ref" value={ref ?? compactId("Rq", request.id)} />
                    <DetailRow label="Status" value={request.status} />
                    <DetailRow label="Payment Method" value={request.payment_method} />
                    <DetailRow label="Pickup Address" value={request.pickup_address} />
                    <DetailRow label="Pickup Latitude" value={request.pickup_lat} />
                    <DetailRow label="Pickup Longitude" value={request.pickup_lng} />
                    <DetailRow label="Pickup From" value={request.pickup_time_from} />
                    <DetailRow label="Pickup To" value={request.pickup_time_to} />
                    <DetailRow label="Created At" value={request.created_at} />
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
    offerStack: {
        gap: 10,
        marginBottom: 4,
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
        marginBottom: 10,
    },
});
