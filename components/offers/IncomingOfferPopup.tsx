import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/contexts/ThemeContext";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import OfferBidCard from "./OfferBidCard";

type OfferPopupProps = {
    visible: boolean;
    requestLabel: string;
    offer: {
        id: string;
        bid_price: number;
        completion_time: string;
        description?: string;
        vendor_name?: string;
        average_rating?: number;
        total_ratings?: number;
        vendor_rating?: number;
        vendor_completed_jobs?: number;
        vendor_distance_km?: number;
    };
    onAccept: () => void;
    onReject: () => void;
    onDismiss: () => void;
    onViewRequest: () => void;
    isAccepting?: boolean;
    isRejecting?: boolean;
};

export default function IncomingOfferPopup({
    visible,
    requestLabel,
    offer,
    onAccept,
    onReject,
    onDismiss,
    onViewRequest,
    isAccepting,
    isRejecting,
}: OfferPopupProps) {
    const { theme } = useAppTheme();
    const { t } = useTranslation();

    if (!visible) return null;

    return (
        <View pointerEvents="box-none" style={styles.wrap}>
            <View style={[styles.popup, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.eyebrow, { color: theme.primary }]}>{t("offers.newVendorOffer")}</Text>
                        <Text style={[styles.title, { color: theme.text }]}>{requestLabel}</Text>
                    </View>
                    <Pressable onPress={onDismiss} hitSlop={10}>
                        <Ionicons name="close" size={18} color={theme.textMuted} />
                    </Pressable>
                </View>

                <OfferBidCard
                    offer={offer}
                    compact
                    onAccept={onAccept}
                    onReject={onReject}
                    isAccepting={isAccepting}
                    isRejecting={isRejecting}
                />

                <Pressable style={({ pressed }) => [styles.linkBtn, { backgroundColor: theme.primarySoft }, pressed && styles.pressed]} onPress={onViewRequest}>
                    <Text style={[styles.linkText, { color: theme.primary }]}>{t("offers.openRequestDetails")}</Text>
                    <Ionicons name="arrow-forward" size={14} color={theme.primary} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 14,
        zIndex: 100,
    },
    popup: {
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 9,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    eyebrow: {
        fontSize: 10,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        fontWeight: "700",
    },
    title: {
        marginTop: 2,
        fontSize: 14,
        fontWeight: "700",
    },
    linkBtn: {
        marginTop: 9,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 10,
        paddingVertical: 9,
    },
    linkText: {
        fontSize: 12,
        fontWeight: "700",
    },
    pressed: {
        opacity: 0.85,
    },
});
