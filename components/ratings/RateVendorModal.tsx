import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { theme } = useAppTheme();
    const { t } = useTranslation();
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
            <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.eyebrow, { color: theme.primary }]}>{t("ratings.completedOrder")}</Text>
                            <Text style={[styles.title, { color: theme.text }]}>{t("ratings.rateVendorName", { name: vendorName ?? t("ratings.yourVendor") })}</Text>
                        </View>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={18} color={theme.textMuted} />
                        </Pressable>
                    </View>

                    <Text style={[styles.label, { color: theme.textMuted }]}>{t("ratings.experienceQuestion")}</Text>
                    <View style={styles.starsRow}>
                        {Array.from({ length: 5 }).map((_, idx) => {
                            const value = idx + 1;
                            const active = value <= rating;
                            return (
                                <Pressable key={value} onPress={() => setRating(value)} hitSlop={8}>
                                    <Ionicons name={active ? "star" : "star-outline"} size={30} color={active ? "#f59e0b" : theme.disabled} />
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={[styles.label, { color: theme.textMuted }]}>{t("ratings.review")}</Text>
                    <TextInput
                        value={review}
                        onChangeText={(value) => {
                            setReview(value);
                            if (showReviewError && value.trim().length >= MIN_REVIEW_LENGTH) {
                                setShowReviewError(false);
                            }
                        }}
                        placeholder={t("ratings.reviewPlaceholder")}
                        placeholderTextColor={theme.inputPlaceholder}
                        multiline
                        numberOfLines={4}
                        style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                        textAlignVertical="top"
                        maxLength={280}
                    />
                    {showReviewError ? <Text style={[styles.errorText, { color: theme.danger }]}>{t("ratings.reviewTooShort")}</Text> : null}

                    <View style={styles.footer}>
                        <Pressable style={({ pressed }) => [styles.ghostBtn, { backgroundColor: theme.surfaceMuted }, pressed && styles.pressed]} onPress={onClose}>
                            <Text style={[styles.ghostText, { color: theme.text }]}>{t("ratings.maybeLater")}</Text>
                        </Pressable>
                        <Pressable
                            disabled={!canSubmit || isSubmitting}
                            onPress={handleSubmit}
                            style={({ pressed }) => [
                                styles.submitBtn,
                                { backgroundColor: theme.primary },
                                pressed && styles.pressed,
                                (!canSubmit || isSubmitting) && styles.disabled,
                            ]}
                        >
                            <Text style={styles.submitText}>{isSubmitting ? t("common.saving") : t("ratings.submitRating")}</Text>
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
        justifyContent: "center",
        padding: 18,
    },
    card: {
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        gap: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    title: {
        marginTop: 2,
        fontSize: 17,
        fontWeight: "700",
    },
    label: {
        marginTop: 2,
        fontSize: 12,
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
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
    },
    errorText: {
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
    },
    ghostText: {
        fontSize: 12,
        fontWeight: "600",
    },
    submitBtn: {
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 9,
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
