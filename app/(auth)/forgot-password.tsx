import AuthScreen from "@/components/ui/AuthScreen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
    const forgotPassword = useForgotPassword();
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            Alert.alert("Missing email", "Please enter your email address.");
            return;
        }

        try {
            await forgotPassword.mutateAsync({ email: trimmedEmail });
            router.push({
                pathname: "/(auth)/reset-password" as any,
                params: { email: trimmedEmail },
            });
        } catch {
            Alert.alert("Request failed", "Please try again.");
        }
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title="Forgot Password"
                subtitle="Enter your registered email address to receive a reset OTP."
                showBackButton
                onBackPress={() => router.back()}
            >
                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <Input
                        placeholder="example@gmail.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <Button
                    title={forgotPassword.isPending ? "Sending..." : "Send OTP"}
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
