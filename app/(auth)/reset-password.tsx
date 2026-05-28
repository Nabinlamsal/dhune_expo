import AuthScreen from "@/components/ui/AuthScreen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import PasswordInput from "@/components/ui/PasswordInput";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, View } from "react-native";
import { PASSWORD_HELPER_TEXT, sanitizeIntegerInput, validatePassword } from "@/utils/validation";

export default function ResetPasswordScreen() {
    const params = useLocalSearchParams<{ email?: string }>();
    const resetPassword = useResetPassword();
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedEmail || !trimmedOtp || !newPassword) {
            Alert.alert(t("auth.missingDetails"), t("auth.missingFieldsMessage"));
            return;
        }
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            Alert.alert("Weak password", passwordError);
            return;
        }

        try {
            await resetPassword.mutateAsync({
                email: trimmedEmail,
                otp: trimmedOtp,
                new_password: newPassword,
            });

            Alert.alert(t("settings.passwordReset"), t("auth.passwordResetLoginMessage"));
            router.replace("/(auth)/login");
        } catch {
            Alert.alert(t("settings.resetFailed"), t("settings.resetFailedMessage"));
        }
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title={t("settings.resetPassword")}
                subtitle={t("auth.resetPasswordSubtitle")}
                showBackButton
                onBackPress={() => router.back()}
            >
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.primary }]}>{t("common.email")}</Text>
                    <Input
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.primary }]}>{t("common.otp")}</Text>
                    <Input
                        placeholder="123456"
                        value={otp}
                        onChangeText={(value) => setOtp(sanitizeIntegerInput(value).slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.primary }]}>{t("settings.newPassword")}</Text>
                    <PasswordInput
                        placeholder={t("settings.enterNewPassword")}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <Text style={[styles.helper, { color: theme.textMuted }]}>{PASSWORD_HELPER_TEXT}</Text>
                </View>

                <Button
                    title={resetPassword.isPending ? t("settings.resetting") : t("settings.resetPassword")}
                    onPress={handleSubmit}
                />
            </AuthScreen>
        </KeyboardWrapper>

    );
}

const styles = StyleSheet.create({
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
    },
    helper: {
        fontSize: 11,
        fontWeight: "500",
    },
});
