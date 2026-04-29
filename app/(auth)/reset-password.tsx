import AuthScreen from "@/components/ui/AuthScreen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import PasswordInput from "@/components/ui/PasswordInput";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function ResetPasswordScreen() {
    const params = useLocalSearchParams<{ email?: string }>();
    const resetPassword = useResetPassword();
    const [email, setEmail] = useState(typeof params.email === "string" ? params.email : "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();
        const trimmedOtp = otp.trim();

        if (!trimmedEmail || !trimmedOtp || !newPassword) {
            Alert.alert("Missing details", "Please complete all fields.");
            return;
        }

        try {
            await resetPassword.mutateAsync({
                email: trimmedEmail,
                otp: trimmedOtp,
                new_password: newPassword,
            });

            Alert.alert("Password reset", "You can now log in with your new password.");
            router.replace("/(auth)/login");
        } catch {
            Alert.alert("Reset failed", "Please check the OTP and try again.");
        }
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title="Reset Password"
                subtitle="Enter the OTP sent to your email and set a new password."
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

                <View style={styles.field}>
                    <Text style={styles.label}>New Password</Text>
                    <PasswordInput
                        placeholder="Enter new password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                </View>

                <Button
                    title={resetPassword.isPending ? "Resetting..." : "Reset Password"}
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
        color: "#0b2457",
    },
});
