import ReportDisputeModal from "@/components/disputes/ReportDisputeModal";
import RateVendorModal from "@/components/ratings/RateVendorModal";
import ExpandableSection from "@/components/ui/ExpandableSection";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useCreateDispute } from "@/hooks/disputes/useDispute";
import { useUpsertOrderRating } from "@/hooks/ratings/useRating";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { useOrderDetail } from "@/hooks/orders/useOrder";
import { useCashPayment, useEsewaPayment, useKhaltiPayment } from "@/hooks/payment/usePayment";
import { compactId, formatCoordinates, formatDateTime, formatMoney } from "@/utils/formatters";
import { formatStatusLabel, getOrderStatusColor, getPaymentStatusColor, getRequestStatusColor } from "@/utils/statusHelpers";

const PRIMARY = "#0b2457";
const ACTION_BG = "#0b2457";
const SURFACE_BG = "#eaf2ff";
const MUTED = "#5b6b86";

const getRatedStorageKey = (orderId: string) => `rating_submitted_${orderId}`;
const getPromptSeenStorageKey = (orderId: string) => `rating_prompt_seen_${orderId}`;

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

export default function OrderDetailScreen() {
    const { id, ref } = useLocalSearchParams<{ id: string; ref?: string }>();
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const { data: order, isLoading } = useOrderDetail(String(id ?? ""));
    const upsertRatingMutation = useUpsertOrderRating();
    const createDisputeMutation = useCreateDispute();

    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [hasRated, setHasRated] = useState(false);

    const cashPaymentMutation = useCashPayment();
    const esewaPaymentMutation = useEsewaPayment();
    const khaltiPaymentMutation = useKhaltiPayment();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const orderId = String(order?.id ?? "");
    const isCompleted = order?.order_status === "COMPLETED";
    const isPaymentProcessing = cashPaymentMutation.isPending || esewaPaymentMutation.isPending || khaltiPaymentMutation.isPending;
    const orderStatusColor = getOrderStatusColor(order?.order_status);
    const paymentStatusColor = getPaymentStatusColor(order?.payment_status);
    const requestStatusColor = getRequestStatusColor(order?.request?.status);

    const pickupFrom = formatDateTime(order?.request?.pickup_time_from);
    const pickupTo = formatDateTime(order?.request?.pickup_time_to);
    const pickupCoords = formatCoordinates(order?.request?.pickup_lat, order?.request?.pickup_lng);

    useEffect(() => {
        if (!orderId) return;

        let active = true;

        (async () => {
            const ratedFlag = await AsyncStorage.getItem(getRatedStorageKey(orderId));
            if (!active) return;
            setHasRated(ratedFlag === "1");
        })();

        return () => {
            active = false;
        };
    }, [orderId]);

    useEffect(() => {
        if (!isCompleted || !orderId || hasRated) return;

        let active = true;

        (async () => {
            const promptSeen = await AsyncStorage.getItem(getPromptSeenStorageKey(orderId));
            if (!active || promptSeen === "1") return;

            setShowRatingModal(true);
            await AsyncStorage.setItem(getPromptSeenStorageKey(orderId), "1");
        })();

        return () => {
            active = false;
        };
    }, [isCompleted, orderId, hasRated]);

    const handleOpenRating = async () => {
        if (!orderId) return;
        setShowRatingModal(true);
        await AsyncStorage.setItem(getPromptSeenStorageKey(orderId), "1");
    };

    const handleSubmitRating = ({ rating, review }: { rating: number; review: string }) => {
        if (!orderId) return;

        upsertRatingMutation.mutate(
            {
                order_id: orderId,
                rating,
                review,
            },
            {
                onSuccess: async () => {
                    await AsyncStorage.setItem(getRatedStorageKey(orderId), "1");
                    setHasRated(true);
                    setShowRatingModal(false);
                    Alert.alert(t("orders.thanksRating"), t("orders.thanksRatingMessage"));
                },
                onError: () => {
                    Alert.alert(t("orders.couldNotSaveRating"), t("errors.tryAgainMoment"));
                },
            }
        );
    };

    const handleSubmitDispute = ({
        dispute_type,
        description,
        image,
    }: {
        dispute_type: "damage" | "missing";
        description: string;
        image?: { uri: string; name: string; mimeType?: string | null } | null;
    }) => {
        if (!orderId) {
            Alert.alert(t("orders.missingOrder"), t("orders.missingOrderMessage"));
            return;
        }

        createDisputeMutation.mutate(
            {
                order_id: orderId,
                dispute_type,
                description: description.trim(),
                image,
            },
            {
                onSuccess: () => {
                    setShowDisputeModal(false);
                    Alert.alert(t("orders.disputeSubmitted"), t("orders.disputeSubmittedMessage"));
                },
                onError: (error: any) => {
                    Alert.alert(t("orders.couldNotSubmitDispute"), error?.message ?? t("errors.tryAgainMoment"));
                },
            }
        );
    };

    const handleCashPayment = () => {
        if (!orderId || isPaymentProcessing) return;

        cashPaymentMutation.mutate(orderId);
        setShowPaymentModal(false);
    };

    const handleKhaltiPayment = () => {
        if (!order || !orderId || isPaymentProcessing) return;

        khaltiPaymentMutation.mutate(orderId);
        setShowPaymentModal(false);
    };

    const handleEsewaPayment = () => {
        if (!orderId || isPaymentProcessing) return;

        esewaPaymentMutation.mutate(orderId);
        setShowPaymentModal(false);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
                <Text style={[styles.centerText, { color: theme.textMuted }]}>{t("orders.loadingDetails")}</Text>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
                <Text style={[styles.centerText, { color: theme.textMuted }]}>{t("orders.notFound")}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title={t("orders.details")}
                    subtitle={ref ? t("common.reference", { ref }) : t("orders.detailsSubtitle")}
                    backHref="/(tabs)/orders"
                />

                <View style={[styles.heroCard, { shadowColor: theme.shadow }]}>
                    <View style={styles.heroTop}>
                        <Text style={styles.heroTitle}>{t("orders.details")}</Text>
                        <View style={[styles.statusPill, { backgroundColor: orderStatusColor }]}>
                            <Text style={styles.statusText}>{formatStatusLabel(order.order_status, t)}</Text>
                        </View>
                    </View>
                    <View style={styles.heroMetaRow}>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="bag-check-outline" size={12} color="#ffffff" />
                            <Text style={styles.heroMetaText}>{ref ?? compactId("Or", order?.id)}</Text>
                        </View>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="cash-outline" size={12} color={theme.accent} />
                            <Text style={styles.heroMetaText}>{formatMoney(order.final_price)}</Text>
                        </View>
                        <View style={styles.heroMetaChip}>
                            <Ionicons name="calendar-outline" size={12} color={theme.accent} />
                            <Text style={styles.heroMetaText}>{formatDateTime(order?.created_at)}</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.paymentSummaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.paymentSummaryTop}>
                        <View>
                            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{t("orders.paymentDue")}</Text>
                            <Text style={[styles.paymentAmount, { color: theme.text }]}>{formatMoney(order.final_price)}</Text>
                        </View>
                        <View style={[styles.paymentBadge, { backgroundColor: `${paymentStatusColor}22` }]}>
                            <Text style={[styles.paymentBadgeText, { color: paymentStatusColor }]}>
                                {formatStatusLabel(order.payment_status, t)}
                            </Text>
                        </View>
                    </View>
                    {order.payment_status !== "PAID" ? (
                        <Pressable
                            style={({ pressed }) => [
                                styles.rateBtn,
                                { backgroundColor: ACTION_BG },
                                pressed && styles.pressed,
                                isPaymentProcessing && {
                                    opacity: 0.6,
                                },
                            ]}
                            disabled={isPaymentProcessing}
                            onPress={() => setShowPaymentModal(true)}
                        >
                            <Text style={styles.rateBtnText}>
                                {isPaymentProcessing
                                    ? t("payments.processing")
                                    : t("payments.payNow")}
                            </Text>
                        </Pressable>
                    ) : null}
                </View>
                <ExpandableSection
                    title={t("orders.vendorDetails")}
                    icon="storefront-outline"
                    summary={order.vendor?.name ?? compactId("Vn", order.vendor?.id)}
                >
                    <DetailRow label={t("common.name")} value={order.vendor?.name} icon="person-circle-outline" />
                    <DetailRow label={t("common.email")} value={order.vendor?.email} icon="mail-outline" />
                    <DetailRow label={t("common.phone")} value={order.vendor?.phone} icon="call-outline" />
                </ExpandableSection>

                <ExpandableSection
                    title={t("orders.pickupDelivery")}
                    icon="location-outline"
                    summary={order.request?.pickup_address ?? pickupFrom}
                >
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
                    <DetailRow label={t("common.address")} value={order.request?.pickup_address} icon="location-outline" />
                    <DetailRow label={t("common.coordinates")} value={pickupCoords} icon="navigate-outline" />
                </ExpandableSection>

                <ExpandableSection
                    title={t("orders.serviceDetails")}
                    icon="construct-outline"
                    summary={t("common.servicesCount", { count: order.services?.length ?? 0 })}
                >
                    {order.services?.length ? (
                        order.services.map((service, idx) => (
                        <View key={`${service.category_id}-${idx}`} style={[styles.serviceBlock, { borderColor: theme.border }]}>
                            <View style={styles.serviceTitleRow}>
                                <Ionicons name="construct-outline" size={14} color={theme.primary} />
                                <Text style={[styles.serviceTitle, { color: theme.primary }]}>{t("common.service", { number: idx + 1 })}</Text>
                            </View>
                            <DetailRow label={t("common.name")} value={service.category_name} icon="grid-outline" />
                            <DetailRow label={t("common.unit")} value={service.selected_unit} icon="cube-outline" />
                            <DetailRow label={t("common.quantity")} value={service.quantity_value} icon="layers-outline" />
                        </View>
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t("orders.noServices")}</Text>
                    )}
                </ExpandableSection>

                <ExpandableSection
                    title={t("payments.paymentDetails")}
                    icon="card-outline"
                    summary={`${formatStatusLabel(order.payment_status, t)} - ${order.request?.payment_method ?? "-"}`}
                >
                    <DetailRow label={t("common.amount")} value={formatMoney(order.final_price)} icon="cash-outline" />
                    <DetailRow label={t("common.paymentMethod")} value={order.request?.payment_method} icon="card-outline" />
                    <DetailRow label={t("payments.paymentStatus")} value={formatStatusLabel(order.payment_status, t)} icon="wallet-outline" />
                    <DetailRow label={t("orders.requestStatus")} value={formatStatusLabel(order.request?.status, t)} icon="pulse-outline" />
                    <View style={[styles.inlineBadge, { backgroundColor: `${requestStatusColor}22` }]}>
                        <Text style={[styles.inlineBadgeText, { color: requestStatusColor }]}>
                            {formatStatusLabel(order.request?.status, t)}
                        </Text>
                    </View>
                </ExpandableSection>

                {isCompleted ? (
                    <View style={[styles.ratingCard, { backgroundColor: theme.mode === "dark" ? theme.surfaceMuted : "#fffdf5", borderColor: theme.accent }]}>
                        <View style={styles.ratingContent}>
                            <Ionicons name={hasRated ? "checkmark-done-circle" : "star"} size={18} color={hasRated ? "#16a34a" : "#f59e0b"} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.ratingTitle, { color: theme.text }]}>{hasRated ? t("orders.ratedTitle") : t("orders.rateVendorTitle")}</Text>
                                <Text style={[styles.ratingSubtitle, { color: theme.textMuted }]}>
                                    {hasRated ? t("orders.ratedSubtitle") : t("orders.ratingSubtitle")}
                                </Text>
                            </View>
                        </View>
                        <Pressable style={({ pressed }) => [styles.rateBtn, { backgroundColor: ACTION_BG }, pressed && styles.pressed]} onPress={handleOpenRating}>
                            <Text style={styles.rateBtnText}>{hasRated ? t("orders.updateRating") : t("orders.rateVendor")}</Text>
                        </Pressable>
                    </View>
                ) : null}

                <View style={[styles.disputeCard, { backgroundColor: theme.mode === "dark" ? theme.surfaceMuted : "#fff7ed", borderColor: theme.accent }]}>
                    <View style={styles.disputeContent}>
                        <Ionicons name="shield-checkmark-outline" size={18} color="#b45309" />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.disputeTitle, { color: theme.text }]}>{t("orders.issueTitle")}</Text>
                            <Text style={[styles.disputeSubtitle, { color: theme.textMuted }]}>
                                {t("orders.issueSubtitle")}
                            </Text>
                        </View>
                    </View>
                    <Pressable style={({ pressed }) => [styles.disputeBtn, { backgroundColor: ACTION_BG }, pressed && styles.pressed]} onPress={() => setShowDisputeModal(true)}>
                        <Text style={styles.disputeBtnText}>{t("orders.reportDispute")}</Text>
                    </Pressable>
                </View>
            </ScrollView>
            {showPaymentModal && (
                <View
                    style={[styles.paymentOverlay, { backgroundColor: theme.overlay }]}
                >
                    <View
                        style={[styles.paymentSheet, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                        <View style={styles.paymentHeader}>
                            <View style={[styles.paymentIconWrap, { backgroundColor: theme.primarySoft }]}>
                                <Ionicons name="wallet-outline" size={18} color={theme.primary} />
                            </View>
                            <View style={styles.paymentHeaderText}>
                                <Text style={[styles.paymentTitle, { color: theme.text }]}>{t("orders.choosePayment")}</Text>
                                <Text style={[styles.paymentSubtitle, { color: theme.textMuted }]}>
                                    Rs {order.final_price}
                                </Text>
                            </View>
                            <Pressable
                                hitSlop={10}
                                onPress={() => setShowPaymentModal(false)}
                                disabled={isPaymentProcessing}
                            >
                                <Ionicons name="close" size={18} color={theme.textMuted} />
                            </Pressable>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.paymentOption,
                                styles.paymentOptionPrimary,
                                { backgroundColor: ACTION_BG, borderColor: ACTION_BG },
                                pressed && styles.pressed,
                                isPaymentProcessing && styles.disabled,
                            ]}
                            disabled={isPaymentProcessing}
                            onPress={handleKhaltiPayment}
                        >
                            <View style={styles.paymentOptionLeft}>
                                <View style={[styles.paymentOptionIcon, { backgroundColor: "rgba(255,255,255,0.16)" }]}>
                                    <Ionicons name="card-outline" size={18} color="#ffffff" />
                                </View>
                                <View style={styles.paymentOptionTextWrap}>
                                    <Text style={[styles.paymentOptionTitle, { color: "#ffffff" }]}>
                                        {t("payments.payWithKhalti")}
                                    </Text>
                                    <Text style={[styles.paymentOptionSubtitle, { color: "#ffffff" }]}>
                                        {t("payments.khaltiSubtitle")}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color="#ffffff" />
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.paymentOption,
                                { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                                pressed && styles.pressed,
                                isPaymentProcessing && styles.disabled,
                            ]}
                            disabled={isPaymentProcessing}
                            onPress={handleEsewaPayment}
                        >
                            <View style={styles.paymentOptionLeft}>
                                <View style={[styles.paymentOptionIcon, { backgroundColor: theme.primarySoft }]}>
                                    <Ionicons name="phone-portrait-outline" size={18} color={theme.primary} />
                                </View>
                                <View style={styles.paymentOptionTextWrap}>
                                    <Text style={[styles.paymentOptionTitle, { color: theme.text }]}>
                                        {t("payments.payWithEsewa")}
                                    </Text>
                                    <Text style={[styles.paymentOptionSubtitle, { color: theme.textMuted }]}>
                                        {t("payments.esewaSubtitle")}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="open-outline" size={16} color={theme.primary} />
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.paymentOption,
                                { backgroundColor: theme.surfaceMuted, borderColor: theme.border },
                                pressed && styles.pressed,
                                isPaymentProcessing && styles.disabled,
                            ]}
                            disabled={isPaymentProcessing}
                            onPress={handleCashPayment}
                        >
                            <View style={styles.paymentOptionLeft}>
                                <View style={[styles.paymentOptionIcon, { backgroundColor: theme.accentSoft }]}>
                                    <Ionicons name="cash-outline" size={18} color={theme.primary} />
                                </View>
                                <View style={styles.paymentOptionTextWrap}>
                                    <Text style={[styles.paymentOptionTitle, { color: theme.text }]}>
                                        {t("payments.paidAsCash")}
                                    </Text>
                                    <Text style={[styles.paymentOptionSubtitle, { color: theme.textMuted }]}>
                                        {t("payments.cashSubtitle")}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="checkmark-circle-outline" size={16} color={theme.primary} />
                        </Pressable>
                    </View>
                </View>
            )}
            <RateVendorModal
                visible={showRatingModal}
                vendorName={order.vendor?.name}
                isSubmitting={upsertRatingMutation.isPending}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleSubmitRating}
            />
            <ReportDisputeModal
                visible={showDisputeModal}
                orderRef={String(ref ?? compactId("Or", order?.id))}
                isSubmitting={createDisputeMutation.isPending}
                onClose={() => setShowDisputeModal(false)}
                onSubmit={handleSubmitDispute}
            />
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
    ratingCard: {
        marginBottom: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fde68a",
        backgroundColor: "#fffdf5",
        padding: 12,
    },
    disputeCard: {
        marginBottom: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fed7aa",
        backgroundColor: "#fff7ed",
        padding: 12,
    },
    ratingContent: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    disputeContent: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        marginBottom: 10,
    },
    ratingTitle: {
        fontSize: 15,
        color: "#111827",
        fontWeight: "700",
    },
    ratingSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: "#6b7280",
    },
    disputeTitle: {
        fontSize: 15,
        color: "#111827",
        fontWeight: "700",
    },
    disputeSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: "#6b7280",
    },
    rateBtn: {
        alignSelf: "flex-start",
        backgroundColor: "#0b2457",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    disputeBtn: {
        alignSelf: "flex-start",
        backgroundColor: "#0b2457",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    rateBtnText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
    },
    disputeBtnText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "700",
    },
    paymentSummaryCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        marginBottom: 10,
    },
    paymentSummaryTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 4,
    },
    paymentAmount: {
        fontSize: 22,
        fontWeight: "800",
    },
    paymentBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    paymentBadgeText: {
        fontSize: 12,
        fontWeight: "800",
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
    detailSpacer: {
        height: 10,
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
    inlineBadge: {
        alignSelf: "flex-start",
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 10,
    },
    inlineBadgeText: {
        fontSize: 12,
        fontWeight: "800",
    },
    paymentOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        padding: 20,
    },
    paymentSheet: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 12,
    },
    paymentHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    paymentIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    paymentHeaderText: {
        flex: 1,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    paymentSubtitle: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "600",
    },
    paymentOption: {
        minHeight: 64,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    paymentOptionPrimary: {
        shadowOpacity: 0.14,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
    },
    paymentOptionLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    paymentOptionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    paymentOptionTextWrap: {
        flex: 1,
    },
    paymentOptionTitle: {
        fontSize: 13,
        fontWeight: "700",
    },
    paymentOptionSubtitle: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: "500",
    },
    disabled: {
        opacity: 0.6,
    },
    pressed: {
        opacity: 0.86,
    },
});



