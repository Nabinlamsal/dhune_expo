import AuthScreen from "@/components/ui/AuthScreen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useResendVerifyEmailOtp } from "@/hooks/auth/useResendVerifyEmailOtp";
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function VerifyEmailScreen() {
    const params = useLocalSearchParams<{
        email?: string;
        source?: string;
        expiresIn?: string;
    }>();
    const verifyEmail = useVerifyEmail();
    const resendOtp = useResendVerifyEmailOtp();
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
    const [otp, setOtp] = useState("");

    const helperCopy = useMemo(() => {
        const expiresIn = Number(params.expiresIn);
        if (Number.isFinite(expiresIn) && expiresIn > 0) {
            const minutes = Math.ceil(expiresIn / 60);
            return t("auth.verifyEmailSubtitleExpires", { count: minutes });
        }

        if (params.source === "login") {
            return t("auth.verifyEmailLoginSubtitle");
        }

        return t("auth.verifyEmailSubtitle");
    }, [params.expiresIn, params.source, t]);

    const handleVerify = async () => {
        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedEmail || !trimmedOtp) {
            Alert.alert(t("auth.missingDetails"), t("auth.missingEmailOtp"));
            return;
        }

        try {
            await verifyEmail.mutateAsync({
                email: trimmedEmail,
                otp: trimmedOtp,
            });

            Alert.alert(t("auth.emailVerified"), t("auth.emailVerifiedMessage"));
            router.replace("/(auth)/login");
        } catch {
            Alert.alert(t("auth.verificationFailed"), t("settings.resetFailedMessage"));
        }
    };

    const handleResend = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            Alert.alert(t("settings.missingEmail"), t("auth.enterEmailFirst"));
            return;
        }

        try {
            await resendOtp.mutateAsync({ email: trimmedEmail });
            Alert.alert(t("settings.otpSent"), t("auth.newOtpSent"));
        } catch {
            Alert.alert(t("auth.resendFailed"), t("errors.defaultTryAgain"));
        }
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title={t("auth.verifyEmail")}
                subtitle={helperCopy}
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
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                <Button
                    title={verifyEmail.isPending ? t("auth.verifying") : t("auth.verifyEmail")}
                    onPress={handleVerify}
                />
                <Button
                    title={resendOtp.isPending ? t("common.sending") : t("auth.resendOtp")}
                    onPress={handleResend}
                    variant="secondary"
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
