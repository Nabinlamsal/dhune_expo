import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/contexts/ThemeContext";
import { formatDateTime, formatMoney } from "@/utils/formatters";
import { Pressable, StyleSheet, Text, View } from "react-native";

type OfferLike = {
    id: string;
    bid_price: number;
    completion_time: string;
    description?: string;
    created_at?: string;
    status?: string;
    vendor_name?: string;
    average_rating?: number;
    total_ratings?: number;
    vendor_rating?: number;
    vendor_completed_jobs?: number;
    vendor_distance_km?: number;
};

type OfferBidCardProps = {
    offer: OfferLike;
    onAccept?: () => void;
    onReject?: () => void;
    isAccepting?: boolean;
    isRejecting?: boolean;
    compact?: boolean;
    highlight?: "best_price" | "fastest" | null;
};

const formatTime = (value?: string) => {
    return formatDateTime(value);
};

export default function OfferBidCard({
    offer,
    onAccept,
    onReject,
    isAccepting,
    isRejecting,
    compact,
    highlight,
}: OfferBidCardProps) {
    const { theme } = useAppTheme();
    const vendorName = offer.vendor_name ?? "Verified Vendor";
    const ratingValue =
        typeof offer.average_rating === "number"
            ? offer.average_rating
            : typeof offer.vendor_rating === "number"
                ? offer.vendor_rating
                : null;
    const ratingCount =
        typeof offer.total_ratings === "number" && offer.total_ratings > 0
            ? offer.total_ratings
            : null;
    const hasRatings = ratingValue !== null;
    const vendorSub = hasRatings
        ? ratingCount !== null
            ? `${ratingValue.toFixed(1)} (${ratingCount} reviews)`
            : `${ratingValue.toFixed(1)} rating`
        : "New vendor";
    const distance = typeof offer.vendor_distance_km === "number" ? `${offer.vendor_distance_km.toFixed(1)} km away` : "";
    const disabled = Boolean(isAccepting || isRejecting);

    return (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }, compact && styles.compactCard]}>
            <View style={styles.topRow}>
                <View style={styles.vendorWrap}>
                    <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
                        <Ionicons name="storefront-outline" size={15} color={theme.primary} />
                    </View>
                    <View style={styles.vendorMeta}>
                        <Text style={[styles.vendorName, { color: theme.text }]} numberOfLines={1}>
                            {vendorName}
                        </Text>
                        <Text style={[styles.vendorSub, { color: theme.textMuted }]}>
                            <Ionicons name={hasRatings ? "star" : "star-outline"} size={11} color="#f59e0b" /> {vendorSub}
                        </Text>
                    </View>
                </View>

                {highlight ? (
                    <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
                        <Text style={[styles.badgeText, { color: theme.primary }]}>{highlight === "best_price" ? "Best Price" : "Fastest"}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.metrics}>
                <View style={[styles.metricBox, { backgroundColor: theme.surfaceMuted }]}>
                    <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Bid</Text>
                    <Text style={[styles.metricValue, { color: theme.text }]}>{formatMoney(offer.bid_price)}</Text>
                </View>
                <View style={[styles.metricBox, { backgroundColor: theme.surfaceMuted }]}>
                    <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Completion</Text>
                    <Text style={[styles.metricValue, { color: theme.text }]} numberOfLines={1}>
                        {formatTime(offer.completion_time)}
                    </Text>
                </View>
            </View>

            {!compact && offer.description ? (
                <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
                    {offer.description}
                </Text>
            ) : null}

            <View style={styles.footer}>
                <Text style={[styles.metaText, { color: theme.textMuted }]}>{distance || "Near your pickup location"}</Text>
                <View style={styles.actions}>
                    <Pressable
                        disabled={disabled}
                        onPress={onReject}
                        style={({ pressed }) => [
                            styles.rejectBtn,
                            { backgroundColor: theme.dangerSoft, borderColor: theme.danger },
                            pressed && styles.pressed,
                            disabled && styles.disabled,
                        ]}
                    >
                        <Text style={[styles.rejectText, { color: theme.danger }]}>{isRejecting ? "Rejecting..." : "Reject"}</Text>
                    </Pressable>
                    <Pressable
                        disabled={disabled}
                        onPress={onAccept}
                        style={({ pressed }) => [
                            styles.acceptBtn,
                            { backgroundColor: theme.success },
                            pressed && styles.pressed,
                            disabled && styles.disabled,
                        ]}
                    >
                        <Text style={styles.acceptText}>{isAccepting ? "Accepting..." : "Accept"}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        gap: 10,
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    compactCard: {
        marginTop: 8,
    },
    topRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    vendorWrap: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    vendorMeta: {
        flex: 1,
    },
    vendorName: {
        fontSize: 15,
        fontWeight: "700",
    },
    vendorSub: {
        fontSize: 12,
        marginTop: 2,
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    metrics: {
        flexDirection: "row",
        gap: 8,
    },
    metricBox: {
        flex: 1,
        borderRadius: 10,
        padding: 8,
    },
    metricLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 15,
        fontWeight: "700",
    },
    description: {
        fontSize: 13,
        lineHeight: 19,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    metaText: {
        flex: 1,
        fontSize: 12,
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    rejectBtn: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    acceptBtn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    rejectText: {
        fontSize: 13,
        fontWeight: "700",
    },
    acceptText: {
        fontSize: 13,
        color: "#ffffff",
        fontWeight: "700",
    },
    pressed: {
        opacity: 0.84,
    },
    disabled: {
        opacity: 0.65,
    },
});
