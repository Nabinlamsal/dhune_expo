import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type RateVendorModalProps = {
    visible: boolean;
    vendorName?: string;
    isSubmitting?: boolean;
    onSubmit: (payload: { rating: number; review: string }) => void;
    onClose: () => void;
};

const MIN_REVIEW_LENGTH = 3;

export default function RateVendorModal({
    visible,
    vendorName,
    isSubmitting,
    onSubmit,
    onClose,
}: RateVendorModalProps) {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState("");
    const [showReviewError, setShowReviewError] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setRating(5);
        setReview("");
        setShowReviewError(false);
    }, [visible]);

    const canSubmit = useMemo(() => {
        const trimmed = review.trim();
        return rating >= 1 && rating <= 5 && trimmed.length >= MIN_REVIEW_LENGTH;
    }, [rating, review]);

    const handleSubmit = () => {
        const trimmed = review.trim();
        if (trimmed.length < MIN_REVIEW_LENGTH) {
            setShowReviewError(true);
            return;
        }
        onSubmit({ rating, review: trimmed });
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.eyebrow}>Completed Order</Text>
                            <Text style={styles.title}>Rate {vendorName ?? "your vendor"}</Text>
                        </View>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={18} color="#64748b" />
                        </Pressable>
                    </View>

                    <Text style={styles.label}>How was your experience?</Text>
                    <View style={styles.starsRow}>
                        {Array.from({ length: 5 }).map((_, idx) => {
                            const value = idx + 1;
                            const active = value <= rating;
                            return (
                                <Pressable key={value} onPress={() => setRating(value)} hitSlop={8}>
                                    <Ionicons name={active ? "star" : "star-outline"} size={30} color={active ? "#f59e0b" : "#cbd5e1"} />
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={styles.label}>Review</Text>
                    <TextInput
                        value={review}
                        onChangeText={(value) => {
                            setReview(value);
                            if (showReviewError && value.trim().length >= MIN_REVIEW_LENGTH) {
                                setShowReviewError(false);
                            }
                        }}
                        placeholder="Share a short review about service quality, timeliness, and care."
                        placeholderTextColor="#94a3b8"
                        multiline
                        numberOfLines={4}
                        style={styles.input}
                        textAlignVertical="top"
                        maxLength={280}
                    />
                    {showReviewError ? <Text style={styles.errorText}>Please add at least 3 characters in your review.</Text> : null}

                    <View style={styles.footer}>
                        <Pressable style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]} onPress={onClose}>
                            <Text style={styles.ghostText}>Maybe later</Text>
                        </Pressable>
                        <Pressable
                            disabled={!canSubmit || isSubmitting}
                            onPress={handleSubmit}
                            style={({ pressed }) => [
                                styles.submitBtn,
                                pressed && styles.pressed,
                                (!canSubmit || isSubmitting) && styles.disabled,
                            ]}
                        >
                            <Text style={styles.submitText}>{isSubmitting ? "Saving..." : "Submit Rating"}</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#0f172a88",
        justifyContent: "center",
        padding: 18,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        gap: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    eyebrow: {
        fontSize: 11,
        color: "#0369a1",
        fontWeight: "700",
        textTransform: "uppercase",
    },
    title: {
        marginTop: 2,
        fontSize: 17,
        color: "#0f172a",
        fontWeight: "700",
    },
    label: {
        marginTop: 2,
        fontSize: 12,
        color: "#334155",
        fontWeight: "600",
    },
    starsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 4,
    },
    input: {
        minHeight: 100,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#0f172a",
        fontSize: 13,
    },
    errorText: {
        color: "#b91c1c",
        fontSize: 12,
        marginTop: -4,
    },
    footer: {
        marginTop: 4,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 8,
    },
    ghostBtn: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 9,
        backgroundColor: "#f8fafc",
    },
    ghostText: {
        color: "#334155",
        fontSize: 12,
        fontWeight: "600",
    },
    submitBtn: {
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 9,
        backgroundColor: "#0b2457",
    },
    submitText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "700",
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.5,
    },
});
