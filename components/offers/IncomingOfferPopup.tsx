import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
    if (!visible) return null;

    return (
        <View pointerEvents="box-none" style={styles.wrap}>
            <View style={styles.popup}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>New Vendor Offer</Text>
                        <Text style={styles.title}>{requestLabel}</Text>
                    </View>
                    <Pressable onPress={onDismiss} hitSlop={10}>
                        <Ionicons name="close" size={18} color="#334155" />
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

                <Pressable style={({ pressed }) => [styles.linkBtn, pressed && styles.pressed]} onPress={onViewRequest}>
                    <Text style={styles.linkText}>Open request details</Text>
                    <Ionicons name="arrow-forward" size={14} color="#1d4ed8" />
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
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "#dbeafe",
        shadowColor: "#020617",
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
        color: "#2563eb",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        fontWeight: "700",
    },
    title: {
        marginTop: 2,
        fontSize: 14,
        color: "#0f172a",
        fontWeight: "700",
    },
    linkBtn: {
        marginTop: 9,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#eff6ff",
        borderRadius: 10,
        paddingVertical: 9,
    },
    linkText: {
        color: "#1d4ed8",
        fontSize: 12,
        fontWeight: "700",
    },
    pressed: {
        opacity: 0.85,
    },
});
