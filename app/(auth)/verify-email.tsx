import AuthScreen from "@/components/ui/AuthScreen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import { useResendVerifyEmailOtp } from "@/hooks/auth/useResendVerifyEmailOtp";
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function VerifyEmailScreen() {
    const params = useLocalSearchParams<{
        email?: string;
        source?: string;
        expiresIn?: string;
    }>();
    const verifyEmail = useVerifyEmail();
    const resendOtp = useResendVerifyEmailOtp();
    const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
    const [otp, setOtp] = useState("");

    const helperCopy = useMemo(() => {
        const expiresIn = Number(params.expiresIn);
        if (Number.isFinite(expiresIn) && expiresIn > 0) {
            const minutes = Math.ceil(expiresIn / 60);
            return `Enter the 6-digit OTP sent to your email. This code expires in about ${minutes} minute${minutes === 1 ? "" : "s"}.`;
        }

        if (params.source === "login") {
            return "Your email must be verified before you can log in. Enter the OTP sent to your email.";
        }

        return "Enter the 6-digit OTP sent to your email.";
    }, [params.expiresIn, params.source]);

    const handleVerify = async () => {
        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedEmail || !trimmedOtp) {
            Alert.alert("Missing details", "Please enter your email and OTP.");
            return;
        }

        try {
            await verifyEmail.mutateAsync({
                email: trimmedEmail,
                otp: trimmedOtp,
            });

            Alert.alert("Email verified", "You can now log in to your account.");
            router.replace("/(auth)/login");
        } catch {
            Alert.alert("Verification failed", "Please check the OTP and try again.");
        }
    };

    const handleResend = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            Alert.alert("Missing email", "Please enter your email first.");
            return;
        }

        try {
            await resendOtp.mutateAsync({ email: trimmedEmail });
            Alert.alert("OTP sent", "A new verification OTP has been sent.");
        } catch {
            Alert.alert("Resend failed", "Please try again.");
        }
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title="Verify Email"
                subtitle={helperCopy}
                showBackButton
                onBackPress={() => router.back()}
            >
                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <Input
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>OTP</Text>
                    <Input
                        placeholder="123456"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                <Button
                    title={verifyEmail.isPending ? "Verifying..." : "Verify Email"}
                    onPress={handleVerify}
                />
                <Button
                    title={resendOtp.isPending ? "Sending..." : "Resend OTP"}
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
        color: "#0b2457",
    },
});
