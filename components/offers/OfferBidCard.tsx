import { Ionicons } from "@expo/vector-icons";
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

const formatMoney = (amount?: number) => {
    if (typeof amount !== "number" || Number.isNaN(amount)) return "Rs -";
    return `Rs ${amount.toLocaleString("en-US")}`;
};

const formatTime = (value?: string) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
        return parsed.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    }
    return value;
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
    const vendorName = offer.vendor_name ?? "Verified Vendor";
    const hasRatings = typeof offer.total_ratings === "number" && offer.total_ratings > 0;
    const vendorSub =
        hasRatings && typeof offer.average_rating === "number"
            ? `${offer.average_rating.toFixed(1)} (${offer.total_ratings} reviews)`
            : "New vendor";
    const distance = typeof offer.vendor_distance_km === "number" ? `${offer.vendor_distance_km.toFixed(1)} km away` : "";
    const disabled = Boolean(isAccepting || isRejecting);

    return (
        <View style={[styles.card, compact && styles.compactCard]}>
            <View style={styles.topRow}>
                <View style={styles.vendorWrap}>
                    <View style={styles.avatar}>
                        <Ionicons name="storefront-outline" size={15} color="#082f49" />
                    </View>
                    <View style={styles.vendorMeta}>
                        <Text style={styles.vendorName} numberOfLines={1}>
                            {vendorName}
                        </Text>
                        <Text style={styles.vendorSub}>
                            <Ionicons name={hasRatings ? "star" : "star-outline"} size={11} color="#f59e0b" /> {vendorSub}
                        </Text>
                    </View>
                </View>

                {highlight ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{highlight === "best_price" ? "Best Price" : "Fastest"}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.metrics}>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Bid</Text>
                    <Text style={styles.metricValue}>{formatMoney(offer.bid_price)}</Text>
                </View>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Completion</Text>
                    <Text style={styles.metricValue} numberOfLines={1}>
                        {formatTime(offer.completion_time)}
                    </Text>
                </View>
            </View>

            {!compact && offer.description ? (
                <Text style={styles.description} numberOfLines={2}>
                    {offer.description}
                </Text>
            ) : null}

            <View style={styles.footer}>
                <Text style={styles.metaText}>{distance || "Near your pickup location"}</Text>
                <View style={styles.actions}>
                    <Pressable
                        disabled={disabled}
                        onPress={onReject}
                        style={({ pressed }) => [styles.rejectBtn, pressed && styles.pressed, disabled && styles.disabled]}
                    >
                        <Text style={styles.rejectText}>{isRejecting ? "Rejecting..." : "Reject"}</Text>
                    </Pressable>
                    <Pressable
                        disabled={disabled}
                        onPress={onAccept}
                        style={({ pressed }) => [styles.acceptBtn, pressed && styles.pressed, disabled && styles.disabled]}
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
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 12,
        gap: 10,
        shadowColor: "#0f172a",
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
        backgroundColor: "#e0f2fe",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    vendorMeta: {
        flex: 1,
    },
    vendorName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0f172a",
    },
    vendorSub: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 2,
    },
    badge: {
        backgroundColor: "#eef2ff",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    badgeText: {
        color: "#3730a3",
        fontSize: 10,
        fontWeight: "700",
    },
    metrics: {
        flexDirection: "row",
        gap: 8,
    },
    metricBox: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 10,
        padding: 8,
    },
    metricLabel: {
        fontSize: 10,
        color: "#64748b",
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 13,
        color: "#0f172a",
        fontWeight: "700",
    },
    description: {
        fontSize: 12,
        color: "#334155",
        lineHeight: 18,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
    },
    metaText: {
        flex: 1,
        fontSize: 11,
        color: "#64748b",
    },
    actions: {
        flexDirection: "row",
        gap: 8,
    },
    rejectBtn: {
        borderWidth: 1,
        borderColor: "#fecaca",
        backgroundColor: "#fff1f2",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    acceptBtn: {
        backgroundColor: "#052e16",
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
    },
    rejectText: {
        fontSize: 12,
        color: "#b91c1c",
        fontWeight: "700",
    },
    acceptText: {
        fontSize: 12,
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
