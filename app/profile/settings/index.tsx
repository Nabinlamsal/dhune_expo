import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { useMyProfile } from "@/hooks/users/useMyProfile";
import { clearTemporaryCache } from "@/services/cache/app-cache.service";
import {
    getUserPreferences,
    setLocationServicesPreference,
    setPushNotificationsPreference,
} from "@/services/settings/preferences.service";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import SettingsOptionTile from "./components/SettingsOptionTile";
import SettingsSwitchTile from "./components/SettingsSwitchTile";

type LanguageOption = "english" | "nepali";
type ExpandableKey =
    | "changePassword"
    | "forgotPassword"
    | "language"
    | "screenMode"
    | null;

function ExpandableSection({
    label,
    title,
    subtitle,
    expanded,
    onPress,
    children,
    colors,
}: {
    label: string;
    title: string;
    subtitle: string;
    expanded: boolean;
    onPress: () => void;
    children?: ReactNode;
    colors: {
        card: string;
        surfaceMuted: string;
        border: string;
        text: string;
        textMuted: string;
        primary: string;
        primaryContrast: string;
    };
}) {
    return (
        <View
            style={[
                styles.expandableWrap,
                {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceMuted,
                },
            ]}
        >
            <Pressable style={styles.expandableHeader} onPress={onPress}>
                <View style={styles.expandableCopy}>
                    <Text style={[styles.smallLabel, { color: colors.textMuted }]}>{label}</Text>
                    <Text style={[styles.expandableTitle, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.expandableSubtitle, { color: colors.textMuted }]}>
                        {subtitle}
                    </Text>
                </View>
                <View
                    style={[
                        styles.chevronWrap,
                        {
                            backgroundColor: expanded ? colors.primary : colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Ionicons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={expanded ? colors.primaryContrast : colors.primary}
                    />
                </View>
            </Pressable>
            {expanded ? (
                <View style={[styles.expandableBody, { borderTopColor: colors.border }]}>
                    {children}
                </View>
            ) : null}
        </View>
    );
}

function SettingToggleRow({
    label,
    description,
    active,
    onPress,
    colors,
}: {
    label: string;
    description: string;
    active: boolean;
    onPress: () => void;
    colors: {
        card: string;
        border: string;
        text: string;
        textMuted: string;
        primary: string;
        primaryContrast: string;
    };
}) {
    return (
        <Pressable
            style={[
                styles.toggleRow,
                {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.toggleDescription, { color: colors.textMuted }]}>
                    {description}
                </Text>
            </View>
            <View
                style={[
                    styles.toggleCircle,
                    {
                        borderColor: colors.border,
                        backgroundColor: active ? colors.primary : colors.card,
                    },
                ]}
            >
                {active ? <Ionicons name="checkmark" size={14} color={colors.primaryContrast} /> : null}
            </View>
        </Pressable>
    );
}

export default function ProfileSettingsScreen() {
    const { data } = useMyProfile();
    const changePassword = useChangePassword();
    const forgotPassword = useForgotPassword();
    const resetPassword = useResetPassword();
    const queryClient = useQueryClient();
    const { theme, mode, preference, setMode } = useAppTheme();

    const colors = useMemo(
        () => ({
            appBackground: theme.background,
            card: theme.card,
            surfaceMuted: theme.surfaceMuted,
            border: theme.border,
            text: theme.text,
            textMuted: theme.textMuted,
            primary: theme.primary,
            primaryContrast: theme.primaryContrast,
            success: theme.success,
            successContrast: theme.successContrast,
            danger: theme.danger,
            dangerSoft: theme.dangerSoft,
        }),
        [theme]
    );

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [resetOtp, setResetOtp] = useState("");
    const [resetNewPassword, setResetNewPassword] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>("english");
    const [expandedSection, setExpandedSection] = useState<ExpandableKey>(null);
    const [showCacheModal, setShowCacheModal] = useState(false);
    const [isClearingCache, setIsClearingCache] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
    const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
    const [isUpdatingPushPreference, setIsUpdatingPushPreference] = useState(false);
    const [isUpdatingLocationPreference, setIsUpdatingLocationPreference] = useState(false);

    useEffect(() => {
        if (!snackbarVisible) {
            return;
        }

        const timer = setTimeout(() => {
            setSnackbarVisible(false);
        }, 2600);

        return () => clearTimeout(timer);
    }, [snackbarVisible]);

    useEffect(() => {
        let active = true;

        const loadPreferences = async () => {
            try {
                const preferences = await getUserPreferences();
                if (!active) return;

                setPushNotificationsEnabled(preferences.pushNotificationsEnabled);
                setLocationServicesEnabled(preferences.locationServicesEnabled);
            } catch {
                if (!active) return;

                setPushNotificationsEnabled(false);
                setLocationServicesEnabled(false);
            } finally {
                if (active) {
                    setIsLoadingPreferences(false);
                }
            }
        };

        void loadPreferences();

        return () => {
            active = false;
        };
    }, []);

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
            Alert.alert("OTP sent", `A password reset OTP was sent to ${email}.`);
        } catch {
            Alert.alert("Request failed", "Please try again.");
        }
    };

    const handleResetPassword = async () => {
        const email = data?.Email?.trim();

        if (!email) {
            Alert.alert("Missing email", "No email is available for this account.");
            return;
        }

        if (!resetOtp.trim() || !resetNewPassword) {
            Alert.alert("Missing fields", "Enter the OTP and your new password.");
            return;
        }

        try {
            await resetPassword.mutateAsync({
                email,
                otp: resetOtp.trim(),
                new_password: resetNewPassword,
            });
            setResetOtp("");
            setResetNewPassword("");
            Alert.alert("Password reset", "Your password has been reset successfully.");
        } catch {
            Alert.alert("Reset failed", "Please check the OTP and try again.");
        }
    };

    const handleClearCache = async () => {
        try {
            setIsClearingCache(true);
            await clearTemporaryCache();
            queryClient.clear();
            setShowCacheModal(false);
            setSnackbarVisible(true);
        } catch {
            Alert.alert("Could not clear cache", "Please try again in a moment.");
        } finally {
            setIsClearingCache(false);
        }
    };

    const toggleSection = (key: Exclude<ExpandableKey, null>) => {
        setExpandedSection((current) => (current === key ? null : key));
    };

    const handlePushNotificationsToggle = async (nextValue: boolean) => {
        if (isUpdatingPushPreference) {
            return;
        }

        if (!nextValue) {
            setPushNotificationsEnabled(false);
            await setPushNotificationsPreference(false);
            return;
        }

        try {
            setIsUpdatingPushPreference(true);

            const existingPermissions = await Notifications.getPermissionsAsync();
            let finalStatus = existingPermissions.status;

            if (finalStatus !== "granted") {
                const requestedPermissions = await Notifications.requestPermissionsAsync();
                finalStatus = requestedPermissions.status;
            }

            if (finalStatus !== "granted") {
                Alert.alert(
                    "Notifications disabled",
                    "Notification permission was not granted, so this setting remains off."
                );
                setPushNotificationsEnabled(false);
                await setPushNotificationsPreference(false);
                return;
            }

            setPushNotificationsEnabled(true);
            await setPushNotificationsPreference(true);
        } catch {
            Alert.alert("Could not update preference", "Please try again.");
        } finally {
            setIsUpdatingPushPreference(false);
        }
    };

    const handleLocationServicesToggle = async (nextValue: boolean) => {
        if (isUpdatingLocationPreference) {
            return;
        }

        if (!nextValue) {
            setLocationServicesEnabled(false);
            await setLocationServicesPreference(false);
            return;
        }

        try {
            setIsUpdatingLocationPreference(true);

            const existingPermissions = await Location.getForegroundPermissionsAsync();
            let finalStatus = existingPermissions.status;

            if (finalStatus !== "granted") {
                const requestedPermissions = await Location.requestForegroundPermissionsAsync();
                finalStatus = requestedPermissions.status;
            }

            if (finalStatus !== "granted") {
                Alert.alert(
                    "Location access denied",
                    "Location permission was not granted, so this setting remains off."
                );
                setLocationServicesEnabled(false);
                await setLocationServicesPreference(false);
                return;
            }

            setLocationServicesEnabled(true);
            await setLocationServicesPreference(true);
        } catch {
            Alert.alert("Could not update preference", "Please try again.");
        } finally {
            setIsUpdatingLocationPreference(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.appBackground }]}>
            <KeyboardAvoidingView
                style={styles.safe}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="Settings & Privacy"
                        subtitle="Security controls, support, and accessibility."
                        backHref="/(tabs)/profile"
                    />

                    <View
                        style={[
                            styles.groupCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={[styles.groupTitle, { color: colors.primary }]}>Security</Text>

                        <ExpandableSection
                            label="Security"
                            title="Change Password"
                            subtitle="Update your password from here."
                            expanded={expandedSection === "changePassword"}
                            onPress={() => toggleSection("changePassword")}
                            colors={colors}
                        >
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.primary }]}>Old Password</Text>
                                <PasswordInput
                                    placeholder="Enter old password"
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                />
                            </View>
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.primary }]}>New Password</Text>
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
                            subtitle="Request an OTP and reset your password securely."
                            expanded={expandedSection === "forgotPassword"}
                            onPress={() => toggleSection("forgotPassword")}
                            colors={colors}
                        >
                            <View
                                style={[
                                    styles.infoPanel,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Ionicons name="mail-outline" size={15} color={colors.primary} />
                                <Text style={[styles.infoText, { color: colors.text }]}>
                                    {data?.Email || "No email available"}
                                </Text>
                            </View>
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.primary }]}>Verification OTP</Text>
                                <Input
                                    placeholder="Enter 6-digit OTP"
                                    value={resetOtp}
                                    onChangeText={setResetOtp}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>
                            <View style={styles.field}>
                                <Text style={[styles.label, { color: colors.primary }]}>New Password</Text>
                                <PasswordInput
                                    placeholder="Create a new password"
                                    value={resetNewPassword}
                                    onChangeText={setResetNewPassword}
                                />
                            </View>
                            <Button
                                title={forgotPassword.isPending ? "Sending..." : "Send OTP"}
                                variant="secondary"
                                onPress={handleForgotPassword}
                            />
                            <Button
                                title={resetPassword.isPending ? "Resetting..." : "Reset Password"}
                                onPress={handleResetPassword}
                            />
                        </ExpandableSection>

                    </View>

                    <View
                        style={[
                            styles.groupCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={[styles.groupTitle, { color: colors.primary }]}>Accessibility</Text>

                        <ExpandableSection
                            label="Accessibility"
                            title="Languages"
                            subtitle="Select the language preference for the UI."
                            expanded={expandedSection === "language"}
                            onPress={() => toggleSection("language")}
                            colors={colors}
                        >
                            <SettingToggleRow
                                label="English"
                                description="Use English labels across the app."
                                active={selectedLanguage === "english"}
                                onPress={() => setSelectedLanguage("english")}
                                colors={colors}
                            />
                            <SettingToggleRow
                                label="Nepali"
                                description="UI-only toggle for Nepali language preference."
                                active={selectedLanguage === "nepali"}
                                onPress={() => setSelectedLanguage("nepali")}
                                colors={colors}
                            />
                        </ExpandableSection>

                        <ExpandableSection
                            label="Accessibility"
                            title="Screen Mode"
                            subtitle="Choose how the app should appear."
                            expanded={expandedSection === "screenMode"}
                            onPress={() => toggleSection("screenMode")}
                            colors={colors}
                        >
                            <SettingToggleRow
                                label="System"
                                description="Follow your device appearance automatically."
                                active={preference === "system"}
                                onPress={() => void setMode("system")}
                                colors={colors}
                            />
                            <SettingToggleRow
                                label="Light"
                                description="Use the brighter Dhune interface."
                                active={preference !== "system" && mode === "light"}
                                onPress={() => void setMode("light")}
                                colors={colors}
                            />
                            <SettingToggleRow
                                label="Dark"
                                description="Reduce glare with a darker interface."
                                active={preference !== "system" && mode === "dark"}
                                onPress={() => void setMode("dark")}
                                colors={colors}
                            />
                        </ExpandableSection>
                    </View>

                    <View
                        style={[
                            styles.groupCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text style={[styles.groupTitle, { color: colors.primary }]}>Preferences</Text>
                        <SettingsSwitchTile
                            icon="notifications-outline"
                            title="Push Notifications"
                            subtitle="Receive app notifications and updates"
                            value={pushNotificationsEnabled}
                            onValueChange={(value) => void handlePushNotificationsToggle(value)}
                            disabled={isLoadingPreferences || isUpdatingPushPreference}
                            colors={{
                                card: colors.card,
                                border: colors.border,
                                text: colors.text,
                                textMuted: colors.textMuted,
                                primary: colors.primary,
                                primarySoft: theme.primarySoft,
                                switchTrackOn: theme.primary,
                                switchTrackOff: theme.borderStrong,
                                switchThumb: theme.primaryContrast,
                                switchThumbDisabled: theme.textSoft,
                            }}
                        />
                        <SettingsSwitchTile
                            icon="location-outline"
                            title="Location Services"
                            subtitle="Allow access to device location"
                            value={locationServicesEnabled}
                            onValueChange={(value) => void handleLocationServicesToggle(value)}
                            disabled={isLoadingPreferences || isUpdatingLocationPreference}
                            colors={{
                                card: colors.card,
                                border: colors.border,
                                text: colors.text,
                                textMuted: colors.textMuted,
                                primary: colors.primary,
                                primarySoft: theme.primarySoft,
                                switchTrackOn: theme.primary,
                                switchTrackOff: theme.borderStrong,
                                switchThumb: theme.primaryContrast,
                                switchThumbDisabled: theme.textSoft,
                            }}
                        />
                    </View>
                    <View>
                        <SettingsOptionTile
                            icon="trash-outline"
                            label="Memory"
                            title="Clear Cache"
                            subtitle="Remove temporary app data without affecting your account or current sign-in."
                            onPress={() => setShowCacheModal(true)}
                            tone="danger"
                            colors={{ ...colors, primarySoft: theme.primarySoft }}
                        />

                        <View style={styles.spacer} />

                        <SettingsOptionTile
                            icon="help-buoy-outline"
                            label="Support"
                            title="Help Center"
                            subtitle="Support contacts, FAQs, terms, and privacy resources."
                            onPress={() => router.push("/profile/settings/help-center")}
                            colors={{ ...colors, primarySoft: theme.primarySoft }}
                        />
                    </View>
                </ScrollView>

                <Modal
                    animationType="fade"
                    transparent
                    visible={showCacheModal}
                    onRequestClose={() => setShowCacheModal(false)}
                >
                    <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
                        <View
                            style={[
                                styles.modalCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Clear App Cache</Text>
                            <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
                                This will remove temporary stored data and may improve app performance.
                            </Text>
                            <View style={styles.modalActions}>
                                <Pressable
                                    onPress={() => setShowCacheModal(false)}
                                    style={[
                                        styles.modalButton,
                                        {
                                            backgroundColor: theme.surfaceMuted,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => void handleClearCache()}
                                    style={[
                                        styles.modalButton,
                                        {
                                            backgroundColor: colors.danger,
                                            borderColor: colors.danger,
                                        },
                                    ]}
                                    disabled={isClearingCache}
                                >
                                    <Text style={[styles.modalButtonText, { color: "#ffffff" }]}>
                                        {isClearingCache ? "Clearing..." : "Clear Cache"}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {snackbarVisible ? (
                    <View style={styles.snackbarHost} pointerEvents="none">
                        <View style={[styles.snackbar, { backgroundColor: colors.success }]}>
                            <Ionicons name="checkmark-circle" size={18} color={colors.successContrast} />
                            <Text style={[styles.snackbarText, { color: colors.successContrast }]}>
                                Cache cleared successfully
                            </Text>
                        </View>
                    </View>
                ) : null}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 24,
        gap: 10,
    },
    groupCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        gap: 10,
    },
    groupTitle: {
        fontSize: 17,
        fontWeight: "800",
    },
    expandableWrap: {
        borderWidth: 1,
        borderRadius: 16,
        overflow: "hidden",
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
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    expandableTitle: {
        fontSize: 16,
        fontWeight: "800",
    },
    expandableSubtitle: {
        marginTop: 3,
        fontSize: 13,
        fontWeight: "500",
    },
    chevronWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    expandableBody: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 4,
        borderTopWidth: 1,
    },
    field: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 6,
    },
    infoPanel: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
    },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 8,
    },
    toggleCopy: {
        flex: 1,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: "700",
    },
    toggleDescription: {
        marginTop: 3,
        fontSize: 13,
        fontWeight: "500",
    },
    toggleCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    spacer: {
        height: 2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    modalCard: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 18,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
    },
    modalMessage: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 21,
        fontWeight: "500",
    },
    modalActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 18,
    },
    modalButton: {
        flex: 1,
        minHeight: 46,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    modalButtonText: {
        fontSize: 14,
        fontWeight: "800",
    },
    snackbarHost: {
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 18,
    },
    snackbar: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    snackbarText: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
    },
});
