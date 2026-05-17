import OfferBidCard from "@/components/offers/OfferBidCard";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useAcceptOffer, useRejectOffer } from "@/hooks/orders/useOffer";
import { useMyRequests } from "@/hooks/orders/useRequest";
import { getOffersByRequest } from "@/services/orders/offer_service";
import { RequestStatus } from "@/types/orders/orders-enums";
import { Offer } from "@/types/orders/offers";
import { formatDate } from "@/utils/formatters";
import { formatStatusLabel, getRequestStatusColor } from "@/utils/statusHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const PAGE_SIZE = 10;

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
    const { theme } = useAppTheme();
    const [page, setPage] = useState(0);
    const offset = page * PAGE_SIZE;
    const { data, isLoading, isFetching } = useMyRequests(PAGE_SIZE, offset);
    const acceptOfferMutation = useAcceptOffer();
    const rejectOfferMutation = useRejectOffer();

    const requests = data?.data ?? [];
    const canGoBack = page > 0;
    const canGoNext = requests.length === PAGE_SIZE;
    const shouldShowPagination = canGoBack || canGoNext;
    const openRequests = requests.filter((req: any) => req.status === "OPEN").slice(0, 8);

    const offerQueries = useQueries({
        queries: openRequests.map((request: any) => ({
            queryKey: ["offers", "request", String(request.id)],
            queryFn: () => getOffersByRequest(String(request.id)),
        })),
    });

    const offersMap = new Map<string, Offer[]>();
    openRequests.forEach((req: any, index: number) => {
        offersMap.set(String(req.id), offerQueries[index]?.data?.data ?? []);
    });

    const handleAccept = (offerId: string) => {
        Alert.alert("Accept this offer?", "This creates your order immediately.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Accept",
                onPress: () => {
                    acceptOfferMutation.mutate(
                        { offer_id: offerId },
                        {
                            onError: () => Alert.alert("Could not accept", "Please try again."),
                        }
                    );
                },
            },
        ]);
    };

    const handleReject = (offerId: string) => {
        Alert.alert("Reject this offer?", "This bid will be removed from your options.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Reject",
                style: "destructive",
                onPress: () => {
                    rejectOfferMutation.mutate(
                        { offer_id: offerId },
                        {
                            onError: () => Alert.alert("Could not reject", "Please try again."),
                        }
                    );
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Requests"
                    subtitle="Track open pickups and incoming bids."
                />

                <Pressable
                    style={({ pressed }) => [
                        styles.createCard,
                        { shadowColor: theme.shadow },
                        pressed && styles.pressed,
                    ]}
                    onPress={() => router.push("/(tabs)/requests/create")}
                >
                    <View style={styles.createLeft}>
                        <Text style={[styles.createLabel, { color: theme.accent }]}>New Request</Text>
                        <Text style={styles.createTitle}>Create Laundry Request</Text>
                        <Text style={styles.createSub}>
                            Add one or more service categories with units and item details.
                        </Text>
                    </View>
                    <Ionicons name="add-circle" size={36} color={theme.accent} />
                </Pressable>

                {isLoading ? (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>Loading requests...</Text>
                ) : requests.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>No requests found.</Text>
                ) : (
                    requests.map((req: any, index) => {
                        const statusColor = getRequestStatusColor(req.status as RequestStatus);
                        const requestRef = `Rq${index + 1}`;
                        const offers = offersMap.get(String(req.id)) ?? [];
                        const pendingOffers = offers.filter((offer) => offer.status === "PENDING");
                        const firstOffer = pendingOffers[0];

                        return (
                            <View key={String(req.id)}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.card,
                                        { backgroundColor: theme.card, borderColor: theme.border },
                                        pressed && styles.pressed,
                                    ]}
                                    onPress={() =>
                                        router.push(`/requests/${req.id}?ref=${encodeURIComponent(requestRef)}` as any)
                                    }
                                >
                                    <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
                                        <Ionicons name="shirt-outline" size={18} color={theme.primary} />
                                    </View>
                                    <View style={styles.body}>
                                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                                            {getCategoryLabel(req)}
                                        </Text>
                                        <Text style={[styles.meta, { color: theme.textSoft }]}>
                                            {requestRef} - {formatDate(req.created_at)}
                                        </Text>
                                        {req.status === "OPEN" ? (
                                            <Text style={[styles.bidCount, { color: theme.success }]}>
                                                {pendingOffers.length} active {pendingOffers.length === 1 ? "bid" : "bids"}
                                            </Text>
                                        ) : null}
                                    </View>
                                    <View style={[styles.pill, { backgroundColor: `${statusColor}22` }]}>
                                        <Text style={[styles.pillText, { color: statusColor }]}>
                                            {formatStatusLabel(String(req.status ?? ""))}
                                        </Text>
                                    </View>
                                </Pressable>

                                {firstOffer ? (
                                    <OfferBidCard
                                        compact
                                        offer={firstOffer}
                                        onAccept={() => handleAccept(firstOffer.id)}
                                        onReject={() => handleReject(firstOffer.id)}
                                        isAccepting={acceptOfferMutation.isPending && acceptOfferMutation.variables?.offer_id === firstOffer.id}
                                        isRejecting={rejectOfferMutation.isPending && rejectOfferMutation.variables?.offer_id === firstOffer.id}
                                    />
                                ) : null}
                            </View>
                        );
                    })
                )}

                {!isLoading && requests.length > 0 && shouldShowPagination ? (
                    <View style={styles.paginationFooter}>
                        <Pressable
                            disabled={!canGoBack || isFetching}
                            onPress={() => setPage((current) => Math.max(0, current - 1))}
                            style={({ pressed }) => [
                                styles.pageBtn,
                                { backgroundColor: theme.card, borderColor: theme.border },
                                pressed && styles.pressed,
                                (!canGoBack || isFetching) && styles.disabled,
                            ]}
                        >
                            <Text style={[styles.pageBtnText, { color: theme.text }]}>Previous</Text>
                        </Pressable>
                        <Text style={[styles.paginationText, { color: theme.textMuted }]}>
                            Page {page + 1}
                            {isFetching ? " ..." : ""}
                        </Text>
                        <Pressable
                            disabled={!canGoNext || isFetching}
                            onPress={() => setPage((current) => current + 1)}
                            style={({ pressed }) => [
                                styles.pageBtn,
                                { backgroundColor: theme.card, borderColor: theme.border },
                                pressed && styles.pressed,
                                (!canGoNext || isFetching) && styles.disabled,
                            ]}
                        >
                            <Text style={[styles.pageBtnText, { color: theme.text }]}>Next</Text>
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
    },
    scroll: {
        padding: 16,
        paddingBottom: 26,
        gap: 8,
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
        borderWidth: 1,
    },
    pageBtnText: {
        fontSize: 13,
        fontWeight: "700",
    },
    paginationText: {
        minWidth: 68,
        textAlign: "center",
        fontSize: 13,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 24,
        fontSize: 15,
        fontWeight: "600",
    },
    createCard: {
        backgroundColor: "#040947",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    createLeft: {
        flex: 1,
        paddingRight: 10,
    },
    createLabel: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        marginBottom: 2,
    },
    createTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    createSub: {
        color: "#ffffff9e",
        fontSize: 14,
        lineHeight: 20,
    },
    card: {
        borderRadius: 16,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        borderWidth: 1,
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
    },
    body: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    meta: {
        marginTop: 2,
        fontSize: 13,
    },
    bidCount: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "700",
    },
    pill: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pillText: {
        fontSize: 11,
        fontWeight: "700",
    },
});


