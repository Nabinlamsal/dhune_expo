import OfferBidCard from "@/components/offers/OfferBidCard";
import LeafletMapView from "@/components/maps/LeafletMapView";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useAcceptOffer, useOffersByRequest, useRejectOffer } from "@/hooks/orders/useOffer";
import { useCancelRequest, useRequestDetail } from "@/hooks/orders/useRequest";
import { Offer } from "@/types/orders/offers";
import { compactId, formatCoordinates, formatDateTime } from "@/utils/formatters";
import { formatStatusLabel, getRequestStatusColor } from "@/utils/statusHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const PRIMARY = "#0b2457";
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
    const { theme } = useAppTheme();

    return (
        <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
            <View style={styles.detailLabelWrap}>
                <Ionicons name={icon} size={12} color={theme.primary} />
                <Text style={[styles.detailLabel, { color: theme.textMuted }]}>{label}</Text>
            </View>
            <Text style={[styles.detailValue, { color: theme.primary }]} numberOfLines={2}>
                {value ?? "-"}
            </Text>
        </View>
    );
}

function SectionCard({ children }: { children: ReactNode }) {
    const { theme } = useAppTheme();

    return (
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <View style={[styles.sectionGloss, { backgroundColor: theme.mode === "dark" ? "rgba(255,255,255,0.04)" : "#ffffffb8" }]} />
            {children}
        </View>
    );
}

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
    const { theme } = useAppTheme();
    const { t } = useTranslation();
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
    const statusColor = getRequestStatusColor(request?.status);

    const pickupFrom = formatDateTime(request?.pickup_time_from);
    const pickupTo = formatDateTime(request?.pickup_time_to);
    const pickupCoords = formatCoordinates(request?.pickup_lat, request?.pickup_lng);
    const hasPickupCoordinates =
        typeof request?.pickup_lat === "number" &&
        typeof request?.pickup_lng === "number" &&
        Number.isFinite(request.pickup_lat) &&
        Number.isFinite(request.pickup_lng);

    const handleAccept = (offerId: string) => {
        Alert.alert(t("offers.acceptPromptTitle"), t("offers.acceptPromptCloseOffers"), [
            { text: t("common.cancel"), style: "cancel" },
            {
                text: t("common.accept"),
                style: "default",
                onPress: () => {
                    acceptOfferMutation.mutate(
                        { offer_id: offerId },
                        {
                            onSuccess: (response) => {
                                const orderId = response.data?.order_id;
                                Alert.alert(t("offers.offerAccepted"), t("offers.orderCreated"));
                                if (orderId) {
                                    router.replace(`/orders/${orderId}` as any);
                                }
                            },
                            onError: () => {
                                Alert.alert(t("offers.couldNotAccept"), t("errors.defaultTryAgain"));
                            },
                        }
                    );
                },
            },
        ]);
    };

    const handleReject = (offerId: string) => {
        Alert.alert(t("offers.rejectPromptTitle"), t("offers.rejectPromptOtherBids"), [
            { text: t("common.cancel"), style: "cancel" },
            {
                text: t("common.reject"),
                style: "destructive",
                onPress: () => {
                    rejectOfferMutation.mutate(
                        { offer_id: offerId },
                        {
                            onError: () => {
                                Alert.alert(t("offers.couldNotReject"), t("errors.defaultTryAgain"));
                            },
                        }
                    );
                },
            },
        ]);
    };

    const handleCancelRequest = () => {
        if (!request) return;
        Alert.alert(t("requests.cancelRequestPrompt"), t("requests.cancelRequestPromptMessage"), [
            { text: t("common.keep"), style: "cancel" },
            {
                text: t("requests.cancelRequest"),
                style: "destructive",
                onPress: () => {
                    cancelRequestMutation.mutate(request.id, {
                        onSuccess: () => {
                            Alert.alert(t("requests.cancelled"), t("requests.cancelledMessage"));
                        },
                        onError: () => {
                            Alert.alert(t("requests.cancelFailed"), t("errors.defaultTryAgain"));
                        },
                    });
                },
            },
        ]);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
                <Text style={[styles.centerText, { color: theme.textMuted }]}>{t("requests.loadingDetails")}</Text>
            </SafeAreaView>
        );
    }

    if (!request) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
                <Text style={[styles.centerText, { color: theme.textMuted }]}>{t("requests.requestNotFound")}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title={t("requests.details")}
                    subtitle={ref ? t("common.reference", { ref }) : t("requests.detailsSubtitle")}
                    backHref="/(tabs)/requests"
                />

                <View style={[styles.heroCard, { shadowColor: theme.shadow }]}>
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>{t("requests.details")}</Text>
                        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>{formatStatusLabel(request.status, t)}</Text>
                        </View>
                    </View>
                    <View style={styles.heroMetaRow}>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="document-text-outline" size={12} color="#ffffff" />
                            <Text style={styles.heroMetaText}>{ref ?? compactId("Rq", request.id)}</Text>
                        </View>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="wallet-outline" size={12} color={theme.accent} />
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
                            <Text style={styles.cancelBtnText}>{cancelRequestMutation.isPending ? t("common.cancelling") : t("requests.cancelRequest")}</Text>
                        </Pressable>
                    </View>
                ) : null}

                <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("requests.offersAndBids")}</Text>
                <SectionCard>
                    {offersLoading ? (
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t("requests.loadingBids")}</Text>
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
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t("requests.noActiveOffers")}</Text>
                    )}
                </SectionCard>

                <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("requests.pickupLocation")}</Text>
                <SectionCard>
                    <View style={styles.windowRow}>
                        <View style={styles.windowCol}>
                            <Text style={[styles.windowLabel, { color: theme.textMuted }]}>{t("common.from")}</Text>
                            <Text style={[styles.windowValue, { color: theme.primary }]}>{pickupFrom}</Text>
                        </View>
                        <View style={[styles.windowDivider, { backgroundColor: theme.border }]} />
                        <View style={styles.windowCol}>
                            <Text style={[styles.windowLabel, { color: theme.textMuted }]}>{t("common.to")}</Text>
                            <Text style={[styles.windowValue, { color: theme.primary }]}>{pickupTo}</Text>
                        </View>
                    </View>
                    <View style={styles.detailSpacer} />
                    {hasPickupCoordinates ? (
                        <LeafletMapView
                            latitude={request.pickup_lat}
                            longitude={request.pickup_lng}
                            mode="readonly"
                            height={180}
                            style={styles.detailMap}
                        />
                    ) : null}
                    <DetailRow label={t("common.address")} value={request.pickup_address} icon="location-outline" />
                    <DetailRow label={t("common.coordinates")} value={pickupCoords} icon="navigate-outline" />
                    <DetailRow label={t("common.created")} value={formatDateTime(request.created_at)} icon="calendar-outline" />
                    <DetailRow label={t("common.paymentMethod")} value={request.payment_method ?? "-"} icon="wallet-outline" />
                </SectionCard>

                <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("requests.serviceDetails")}</Text>
                {request.services?.length ? (
                    request.services.map((service, idx) => (
                        <SectionCard key={`${service.category_id}-${idx}`}>
                            <View style={styles.serviceTitleRow}>
                                <Ionicons name="construct-outline" size={14} color={theme.primary} />
                                <Text style={[styles.serviceTitle, { color: theme.primary }]}>{t("common.service", { number: idx + 1 })}</Text>
                            </View>
                            <DetailRow label={t("common.unit")} value={service.selected_unit} icon="cube-outline" />
                            <DetailRow label={t("common.quantity")} value={service.quantity_value} icon="layers-outline" />
                            <DetailRow label={t("common.description")} value={service.description ?? "-"} icon="reader-outline" />
                        </SectionCard>
                    ))
                ) : (
                    <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t("requests.noServices")}</Text>
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
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#ffffff",
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
        fontSize: 13,
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
        fontSize: 12,
        color: MUTED,
        marginBottom: 2,
        fontWeight: "600",
    },
    windowValue: {
        fontSize: 14,
        color: PRIMARY,
        fontWeight: "700",
    },
    summaryGrid: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: "800",
    },
    summaryDivider: {
        width: 1,
        height: 34,
        marginHorizontal: 12,
    },
    detailSpacer: {
        height: 10,
    },
    detailMap: {
        marginBottom: 10,
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
        fontSize: 12,
        color: MUTED,
        fontWeight: "600",
    },
    detailValue: {
        flex: 1.35,
        textAlign: "right",
        fontSize: 14,
        color: PRIMARY,
        fontWeight: "700",
    },
    serviceBlock: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    serviceTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    serviceTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: PRIMARY,
    },
    emptyText: {
        color: MUTED,
        fontSize: 14,
    },
    pressed: {
        opacity: 0.86,
    },
    disabled: {
        opacity: 0.65,
    },
});
