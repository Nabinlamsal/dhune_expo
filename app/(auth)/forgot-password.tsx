import AuthScreen from "@/components/ui/AuthScreen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
    const forgotPassword = useForgotPassword();
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            Alert.alert(t("settings.missingEmail"), t("auth.missingEmailMessage"));
            return;
        }

        try {
            await forgotPassword.mutateAsync({ email: trimmedEmail });
            router.push({
                pathname: "/(auth)/reset-password" as any,
                params: { email: trimmedEmail },
            });
        } catch {
            Alert.alert(t("settings.requestFailed"), t("errors.defaultTryAgain"));
        }
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title={t("settings.forgotPassword")}
                subtitle={t("auth.forgotPasswordSubtitle")}
                showBackButton
                onBackPress={() => router.back()}
            >
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.primary }]}>{t("common.email")}</Text>
                    <Input
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Button
                    title={forgotPassword.isPending ? t("common.sending") : t("settings.sendOtp")}
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
});
