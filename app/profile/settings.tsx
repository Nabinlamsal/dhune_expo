import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { useMyProfile } from "@/hooks/users/useMyProfile";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type ModeOption = "light" | "dark";
type LanguageOption = "english" | "nepali";

function ExpandableSection({
    label,
    title,
    subtitle,
    expanded,
    onPress,
    children,
}: {
    label: string;
    title: string;
    subtitle: string;
    expanded: boolean;
    onPress: () => void;
    children?: ReactNode;
}) {
    return (
        <View style={styles.expandableWrap}>
            <Pressable
                style={({ pressed }) => [styles.expandableHeader, pressed && styles.pressed]}
                onPress={onPress}
            >
                <View style={styles.expandableCopy}>
                    <Text style={styles.smallLabel}>{label}</Text>
                    <Text style={styles.expandableTitle}>{title}</Text>
                    <Text style={styles.expandableSubtitle}>{subtitle}</Text>
                </View>
                <View style={[styles.chevronWrap, expanded && styles.chevronWrapActive]}>
                    <Ionicons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={expanded ? "#ffffff" : "#0b2457"}
                    />
                </View>
            </Pressable>
            {expanded ? <View style={styles.expandableBody}>{children}</View> : null}
        </View>
    );
}

function SettingToggleRow({
    label,
    description,
    active,
    onPress,
}: {
    label: string;
    description: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
            onPress={onPress}
        >
            <View style={styles.toggleCopy}>
                <Text style={styles.toggleLabel}>{label}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
            </View>
            <View style={[styles.toggleCircle, active && styles.toggleCircleActive]}>
                {active ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
            </View>
        </Pressable>
    );
}

export default function ProfileSettingsScreen() {
    const { data } = useMyProfile();
    const changePassword = useChangePassword();
    const forgotPassword = useForgotPassword();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>("english");
    const [screenMode, setScreenMode] = useState<ModeOption>("light");
    const [expandedSection, setExpandedSection] = useState<
        "changePassword" | "forgotPassword" | "language" | "screenMode" | null
    >(null);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            Alert.alert("Missing fields", "Please enter your old and new password.");
            return;
        }

        try {
            await changePassword.mutateAsync({
                old_password: oldPassword,
                new_password: newPassword,
            });

            setOldPassword("");
            setNewPassword("");
            Alert.alert("Password updated", "Your password has been changed.");
        } catch {
            Alert.alert("Update failed", "Please try again.");
        }
    };

    const handleForgotPassword = async () => {
        const email = data?.Email?.trim();

        if (!email) {
            Alert.alert("Missing email", "No email is available for this account.");
            return;
        }

        try {
            await forgotPassword.mutateAsync({ email });
            Alert.alert("Reset link sent", `Password reset instructions were sent to ${email}.`);
        } catch {
            Alert.alert("Request failed", "Please try again.");
        }
    };

    const toggleSection = (
        key: "changePassword" | "forgotPassword" | "language" | "screenMode"
    ) => {
        setExpandedSection((current) => (current === key ? null : key));
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={styles.safe}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="Settings & Privacy"
                        subtitle="Security controls and accessibility."
                        backHref="/(tabs)/profile"
                    />

                    <View style={styles.groupCard}>
                        <Text style={styles.groupTitle}>Security</Text>

                        <ExpandableSection
                            label="Security"
                            title="Change Password"
                            subtitle="Update your password from here."
                            expanded={expandedSection === "changePassword"}
                            onPress={() => toggleSection("changePassword")}
                        >
                            <View style={styles.field}>
                                <Text style={styles.label}>Old Password</Text>
                                <PasswordInput
                                    placeholder="Enter old password"
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>New Password</Text>
                                <PasswordInput
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                            </View>
                            <Button
                                title={changePassword.isPending ? "Updating..." : "Change Password"}
                                onPress={handleChangePassword}
                            />
                        </ExpandableSection>

                        <ExpandableSection
                            label="Security"
                            title="Forgot Password"
                            subtitle="Send a password reset link to your email."
                            expanded={expandedSection === "forgotPassword"}
                            onPress={() => toggleSection("forgotPassword")}
                        >
                            <View style={styles.infoPanel}>
                                <Ionicons name="mail-outline" size={15} color="#0b2457" />
                                <Text style={styles.infoText}>{data?.Email || "No email available"}</Text>
                            </View>
                            <Button
                                title={forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
                                variant="secondary"
                                onPress={handleForgotPassword}
                            />
                        </ExpandableSection>
                    </View>

                    <View style={styles.groupCard}>
                        <Text style={styles.groupTitle}>Accessibility</Text>

                        <ExpandableSection
                            label="Accessibility"
                            title="Languages"
                            subtitle="Select the language preference for the UI."
                            expanded={expandedSection === "language"}
                            onPress={() => toggleSection("language")}
                        >
                            <SettingToggleRow
                                label="English"
                                description="Use English labels across the app."
                                active={selectedLanguage === "english"}
                                onPress={() => setSelectedLanguage("english")}
                            />
                            <SettingToggleRow
                                label="Nepali"
                                description="UI-only toggle for Nepali language preference."
                                active={selectedLanguage === "nepali"}
                                onPress={() => setSelectedLanguage("nepali")}
                            />
                        </ExpandableSection>

                        <ExpandableSection
                            label="Accessibility"
                            title="Screen Mode"
                            subtitle="Choose how the app should appear."
                            expanded={expandedSection === "screenMode"}
                            onPress={() => toggleSection("screenMode")}
                        >
                            <SettingToggleRow
                                label="Light"
                                description="Default appearance."
                                active={screenMode === "light"}
                                onPress={() => setScreenMode("light")}
                            />
                            <SettingToggleRow
                                label="Dark"
                                description="Preview dark preference locally."
                                active={screenMode === "dark"}
                                onPress={() => setScreenMode("dark")}
                            />
                        </ExpandableSection>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#edf4ff",
    },
    container: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 20,
        gap: 10,
    },
    groupCard: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        padding: 14,
    },
    groupTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#0b2457",
        marginBottom: 12,
    },
    expandableWrap: {
        borderWidth: 1,
        borderColor: "#dbe7ff",
        borderRadius: 14,
        backgroundColor: "#f8fbff",
        overflow: "hidden",
        marginBottom: 10,
    },
    expandableHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    expandableCopy: {
        flex: 1,
    },
    smallLabel: {
        fontSize: 10,
        color: "#64748b",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    expandableTitle: {
        fontSize: 14,
        color: "#0f172a",
        fontWeight: "800",
    },
    expandableSubtitle: {
        marginTop: 3,
        fontSize: 11,
        color: "#64748b",
        fontWeight: "500",
    },
    chevronWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#eff6ff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
        alignItems: "center",
        justifyContent: "center",
    },
    chevronWrapActive: {
        backgroundColor: "#0b2457",
        borderColor: "#0b2457",
    },
    expandableBody: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: "#e5efff",
    },
    field: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        color: "#0b2457",
        fontWeight: "700",
        marginBottom: 6,
    },
    infoPanel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: "#0f172a",
        fontWeight: "600",
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 8,
        backgroundColor: "#ffffff",
    },
    toggleCopy: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 13,
        color: "#0f172a",
        fontWeight: "700",
    },
    toggleDescription: {
        marginTop: 3,
        fontSize: 11,
        color: "#64748b",
        fontWeight: "500",
    },
    toggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: "#bfd2f6",
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    toggleCircleActive: {
        backgroundColor: "#0b2457",
        borderColor: "#0b2457",
    },
    pressed: {
        opacity: 0.85,
    },
});
