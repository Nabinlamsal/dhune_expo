import OfferBidCard from "@/components/offers/OfferBidCard";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAcceptOffer, useOffersByRequest, useRejectOffer } from "@/hooks/orders/useOffer";
import { useCancelRequest, useRequestDetail } from "@/hooks/orders/useRequest";
import { Offer } from "@/types/orders/offers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

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
    const cancelRequestMutation = useCancelRequest();

    const request = data?.data;
    const offers = offersResponse?.data ?? [];
    const pendingOffers = offers.filter((offer) => offer.status === "PENDING");
    const bestPriceOfferId = getBestPriceOfferId(offers);
    const fastestOfferId = getFastestOfferId(offers);
    const isOpen = request?.status === "OPEN";

    const pickupFrom = formatDateTime(request?.pickup_time_from);
    const pickupTo = formatDateTime(request?.pickup_time_to);
    const pickupCoords =
        request?.pickup_lat != null && request?.pickup_lng != null
            ? `${request.pickup_lat}, ${request.pickup_lng}`
            : "-";

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

    const handleCancelRequest = () => {
        if (!request) return;
        Alert.alert("Cancel request?", "This request will be marked as cancelled.", [
            { text: "Keep", style: "cancel" },
            {
                text: "Cancel Request",
                style: "destructive",
                onPress: () => {
                    cancelRequestMutation.mutate(request.id, {
                        onSuccess: () => {
                            Alert.alert("Request cancelled", "Your request is now cancelled.");
                        },
                        onError: () => {
                            Alert.alert("Could not cancel", "Please try again.");
                        },
                    });
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
                <ScreenHeader
                    title="Request Details"
                    subtitle={ref ? `Reference ${ref}` : "Open request, bids, and pickup info."}
                    backHref="/(tabs)/requests"
                />

                <View style={styles.heroCard}>
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>Request Details</Text>
                        <View style={styles.statusPill}>
                            <Text style={styles.statusText}>{request.status ?? "Unknown"}</Text>
                        </View>
                    </View>
                    <View style={styles.heroMetaRow}>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="document-text-outline" size={12} color="#ffffff" />
                            <Text style={styles.heroMetaText}>{ref ?? compactId("Rq", request.id)}</Text>
                        </View>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="wallet-outline" size={12} color={PRIMARY_ACCENT} />
                            <Text style={styles.heroMetaText}>{request.payment_method ?? "-"}</Text>
                        </View>
                    </View>
                </View>

                {isOpen ? (
                    <View style={styles.actionRow}>
                        <Pressable
                            onPress={handleCancelRequest}
                            disabled={cancelRequestMutation.isPending}
                            style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed, cancelRequestMutation.isPending && styles.disabled]}
                        >
                            <Text style={styles.cancelBtnText}>{cancelRequestMutation.isPending ? "Cancelling..." : "Cancel Request"}</Text>
                        </Pressable>
                    </View>
                ) : null}

                <Text style={styles.sectionTitle}>Offers & Bids</Text>
                <SectionCard>
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

                <Text style={styles.sectionTitle}>Pickup Details</Text>
                <SectionCard>
                    <DetailRow label="Address" value={request.pickup_address} icon="location-outline" />
                    <DetailRow label="Coordinates" value={pickupCoords} icon="navigate-outline" />
                    <DetailRow label="Created" value={formatDateTime(request.created_at)} icon="calendar-outline" />
                </SectionCard>

                <Text style={styles.sectionTitle}>Services</Text>
                {request.services?.length ? (
                    request.services.map((service, idx) => (
                        <SectionCard key={`${service.category_id}-${idx}`}>
                            <View style={styles.serviceTitleRow}>
                                <Ionicons name="construct-outline" size={14} color={PRIMARY} />
                                <Text style={styles.serviceTitle}>Service {idx + 1}</Text>
                            </View>
                            <DetailRow label="Category" value={`Ct${idx + 1}`} icon="pricetag-outline" />
                            <DetailRow label="Unit" value={service.selected_unit} icon="cube-outline" />
                            <DetailRow label="Quantity" value={service.quantity_value} icon="layers-outline" />
                            <DetailRow label="Description" value={service.description ?? "-"} icon="reader-outline" />
                        </SectionCard>
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
        backgroundColor: SURFACE_BG,
    },
    scroll: {
        padding: 16,
        paddingTop: 12,
        paddingBottom: 32,
    },
    centerText: {
        marginTop: 24,
        textAlign: "center",
        color: MUTED,
    },
    heroCard: {
        backgroundColor: PRIMARY,
        borderRadius: 20,
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
    actionRow: {
        alignItems: "flex-end",
        marginBottom: 8,
    },
    cancelBtn: {
        backgroundColor: "#b4232f",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    cancelBtnText: {
        color: "#ffffff",
        fontSize: 11,
        fontWeight: "700",
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
    offerStack: {
        gap: 10,
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
    pressed: {
        opacity: 0.86,
    },
    disabled: {
        opacity: 0.65,
    },
});
