import { DisputeType, DisputeUploadFile } from "@/types/disputes/disputes";
import { useAppTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type ReportDisputeModalProps = {
    visible: boolean;
    orderRef: string;
    isSubmitting?: boolean;
    onSubmit: (payload: {
        dispute_type: DisputeType;
        description: string;
        image?: DisputeUploadFile | null;
    }) => void;
    onClose: () => void;
};

const DISPUTE_OPTIONS: { labelKey: string; value: DisputeType }[] = [
    { labelKey: "disputes.tornDamaged", value: "damage" },
    { labelKey: "disputes.missingLost", value: "missing" },
];

export default function ReportDisputeModal({
    visible,
    orderRef,
    isSubmitting,
    onSubmit,
    onClose,
}: ReportDisputeModalProps) {
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const [disputeType, setDisputeType] = useState<DisputeType | null>(null);
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<DisputeUploadFile | null>(null);
    const [showTypeError, setShowTypeError] = useState(false);
    const [showDescriptionError, setShowDescriptionError] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setDisputeType(null);
        setDescription("");
        setImage(null);
        setShowTypeError(false);
        setShowDescriptionError(false);
    }, [visible]);

    const canSubmit = useMemo(() => {
        return !!disputeType && description.trim().length > 0;
    }, [description, disputeType]);

    const pickImage = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*"],
            copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        setImage({
            uri: asset.uri,
            name: asset.name,
            mimeType: asset.mimeType,
        });
    };

    const handleSubmit = () => {
        const trimmedDescription = description.trim();

        if (!disputeType) {
            setShowTypeError(true);
        }

        if (!trimmedDescription) {
            setShowDescriptionError(true);
        }

        if (!disputeType || !trimmedDescription) {
            return;
        }

        onSubmit({
            dispute_type: disputeType,
            description: trimmedDescription,
            image,
        });
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.eyebrow, { color: theme.primary }]}>{t("disputes.orderSupport")}</Text>
                            <Text style={[styles.title, { color: theme.text }]}>{t("orders.reportDispute")}</Text>
                        </View>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={18} color={theme.textMuted} />
                        </Pressable>
                    </View>

                    <View style={[styles.refCard, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                        <Text style={[styles.refLabel, { color: theme.textMuted }]}>{t("disputes.orderReference")}</Text>
                        <Text style={[styles.refValue, { color: theme.text }]}>{orderRef}</Text>
                    </View>

                    <Text style={[styles.label, { color: theme.textMuted }]}>{t("disputes.disputeType")}</Text>
                    <View style={styles.optionList}>
                        {DISPUTE_OPTIONS.map((option) => {
                            const active = disputeType === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => {
                                        setDisputeType(option.value);
                                        setShowTypeError(false);
                                    }}
                                    style={({ pressed }) => [
                                        styles.optionCard,
                                        { backgroundColor: theme.card, borderColor: theme.border },
                                        active && { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <View style={[styles.radio, { borderColor: active ? theme.primary : theme.textSoft }]}>
                                        {active ? <View style={[styles.radioDot, { backgroundColor: theme.primary }]} /> : null}
                                    </View>
                                    <Text style={[styles.optionText, { color: active ? theme.primary : theme.text }]}>
                                        {t(option.labelKey)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    {showTypeError ? <Text style={[styles.errorText, { color: theme.danger }]}>{t("disputes.typeError")}</Text> : null}

                    <Text style={[styles.label, { color: theme.textMuted }]}>{t("common.description")}</Text>
                    <TextInput
                        value={description}
                        onChangeText={(value) => {
                            setDescription(value);
                            if (showDescriptionError && value.trim()) {
                                setShowDescriptionError(false);
                            }
                        }}
                        placeholder={t("disputes.descriptionPlaceholder")}
                        placeholderTextColor={theme.inputPlaceholder}
                        multiline
                        numberOfLines={4}
                        style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                        textAlignVertical="top"
                        maxLength={400}
                    />
                    {showDescriptionError ? <Text style={[styles.errorText, { color: theme.danger }]}>{t("disputes.descriptionError")}</Text> : null}

                    <Text style={[styles.label, { color: theme.textMuted }]}>{t("disputes.proofImage")}</Text>
                    <View style={styles.uploadRow}>
                        <Pressable style={({ pressed }) => [styles.uploadBtn, { backgroundColor: theme.primarySoft }, pressed && styles.pressed]} onPress={pickImage}>
                            <Ionicons name="image-outline" size={16} color={theme.primary} />
                            <Text style={[styles.uploadBtnText, { color: theme.primary }]}>{image ? t("disputes.changeImage") : t("disputes.chooseImage")}</Text>
                        </Pressable>
                        {image ? (
                            <Pressable style={({ pressed }) => [styles.clearBtn, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }, pressed && styles.pressed]} onPress={() => setImage(null)}>
                                <Text style={[styles.clearBtnText, { color: theme.textMuted }]}>{t("disputes.remove")}</Text>
                            </Pressable>
                        ) : null}
                    </View>
                    <Text style={[styles.fileName, { color: theme.textMuted }]} numberOfLines={1}>
                        {image?.name ?? t("disputes.optionalProof")}
                    </Text>

                    <View style={styles.footer}>
                        <Pressable style={({ pressed }) => [styles.ghostBtn, { backgroundColor: theme.surfaceMuted }, pressed && styles.pressed]} onPress={onClose}>
                        <Text style={[styles.ghostText, { color: theme.text }]}>{t("common.cancel")}</Text>
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
                            <Text style={styles.submitText}>{isSubmitting ? t("common.submitting") : t("disputes.submitDispute")}</Text>
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
    refCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
    },
    refLabel: {
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    refValue: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: "700",
    },
    label: {
        marginTop: 2,
        fontSize: 12,
        fontWeight: "600",
    },
    optionList: {
        gap: 8,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 11,
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 999,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
    },
    optionText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
    },
    input: {
        minHeight: 110,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
    },
    uploadRow: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    uploadBtnText: {
        fontSize: 12,
        fontWeight: "700",
    },
    clearBtn: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
    },
    clearBtnText: {
        fontSize: 12,
        fontWeight: "600",
    },
    fileName: {
        marginTop: -4,
        fontSize: 12,
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
