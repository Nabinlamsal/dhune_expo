import { DisputeType, DisputeUploadFile } from "@/types/disputes/disputes";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
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

const DISPUTE_OPTIONS: { label: string; value: DisputeType }[] = [
    { label: "Torn or Damaged Clothes", value: "damage" },
    { label: "Missing or Lost Clothes", value: "missing" },
];

export default function ReportDisputeModal({
    visible,
    orderRef,
    isSubmitting,
    onSubmit,
    onClose,
}: ReportDisputeModalProps) {
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
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.eyebrow}>Order Support</Text>
                            <Text style={styles.title}>Report Vendor Dispute</Text>
                        </View>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <Ionicons name="close" size={18} color="#64748b" />
                        </Pressable>
                    </View>

                    <View style={styles.refCard}>
                        <Text style={styles.refLabel}>Order reference</Text>
                        <Text style={styles.refValue}>{orderRef}</Text>
                    </View>

                    <Text style={styles.label}>Dispute type</Text>
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
                                        active && styles.optionCardActive,
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <View style={[styles.radio, active && styles.radioActive]}>
                                        {active ? <View style={styles.radioDot} /> : null}
                                    </View>
                                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    {showTypeError ? <Text style={styles.errorText}>Please choose a dispute type.</Text> : null}

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={(value) => {
                            setDescription(value);
                            if (showDescriptionError && value.trim()) {
                                setShowDescriptionError(false);
                            }
                        }}
                        placeholder="Describe what was damaged or missing so admin can review it."
                        placeholderTextColor="#94a3b8"
                        multiline
                        numberOfLines={4}
                        style={styles.input}
                        textAlignVertical="top"
                        maxLength={400}
                    />
                    {showDescriptionError ? <Text style={styles.errorText}>Please add a short description.</Text> : null}

                    <Text style={styles.label}>Proof image</Text>
                    <View style={styles.uploadRow}>
                        <Pressable style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed]} onPress={pickImage}>
                            <Ionicons name="image-outline" size={16} color="#0b2457" />
                            <Text style={styles.uploadBtnText}>{image ? "Change Image" : "Choose Image"}</Text>
                        </Pressable>
                        {image ? (
                            <Pressable style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]} onPress={() => setImage(null)}>
                                <Text style={styles.clearBtnText}>Remove</Text>
                            </Pressable>
                        ) : null}
                    </View>
                    <Text style={styles.fileName} numberOfLines={1}>
                        {image?.name ?? "Optional"}
                    </Text>

                    <View style={styles.footer}>
                        <Pressable style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]} onPress={onClose}>
                            <Text style={styles.ghostText}>Cancel</Text>
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
                            <Text style={styles.submitText}>{isSubmitting ? "Submitting..." : "Submit Dispute"}</Text>
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
    refCard: {
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        padding: 12,
    },
    refLabel: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: "600",
        textTransform: "uppercase",
    },
    refValue: {
        marginTop: 4,
        fontSize: 15,
        color: "#0f172a",
        fontWeight: "700",
    },
    label: {
        marginTop: 2,
        fontSize: 12,
        color: "#334155",
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
        borderColor: "#cbd5e1",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: "#ffffff",
    },
    optionCardActive: {
        borderColor: "#0b2457",
        backgroundColor: "#eff6ff",
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: "#94a3b8",
        alignItems: "center",
        justifyContent: "center",
    },
    radioActive: {
        borderColor: "#0b2457",
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#0b2457",
    },
    optionText: {
        flex: 1,
        color: "#0f172a",
        fontSize: 13,
        fontWeight: "600",
    },
    optionTextActive: {
        color: "#0b2457",
    },
    input: {
        minHeight: 110,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: "#0f172a",
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
        backgroundColor: "#eaf2ff",
    },
    uploadBtnText: {
        color: "#0b2457",
        fontSize: 12,
        fontWeight: "700",
    },
    clearBtn: {
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    clearBtnText: {
        color: "#475569",
        fontSize: 12,
        fontWeight: "600",
    },
    fileName: {
        marginTop: -4,
        fontSize: 12,
        color: "#64748b",
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
