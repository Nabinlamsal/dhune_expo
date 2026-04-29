import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import AuthScreen from "../../components/ui/AuthScreen";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";

import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import { extractErrorMessage, isEmailNotVerifiedError } from "@/services/auth/auth-error";
import { useLogin } from "../../hooks/auth/useLogin";
import { LoginRequest } from "../../types/auth/login";

export default function LoginScreen() {
    const { mutate, isPending } = useLogin();

    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        console.log("Login button pressed");

        const payload: LoginRequest = {
            email_or_phone: emailOrPhone,
            password,
        };

        console.log("Payload:", payload);

        mutate(payload, {
            onSuccess: (res) => {
                console.log("SUCCESS:", res);
            },
            onError: (err) => {
                console.log("ERROR:", err);
                if (isEmailNotVerifiedError(err)) {
                    router.push({
                        pathname: "/(auth)/verify-email" as any,
                        params: {
                            email: emailOrPhone.trim(),
                            source: "login",
                        },
                    });
                    return;
                }

                Alert.alert("Login failed", extractErrorMessage(err));
            },
        });
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title="Welcome Back"
                subtitle="Sign in to manage pickup requests, track orders, and stay updated in one place."
                header={
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../../assets/logo.png")}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.logoText}>Dhune.np</Text>
                    </View>
                }
                footer={
                    <Pressable
                        style={styles.signupContainer}
                        onPress={() => router.replace("/(auth)/signup")}
                    >
                        <Text style={styles.signupText}>
                            Don&apos;t have an account?{" "}
                            <Text style={styles.signupHighlight}>Sign Up</Text>
                        </Text>
                    </Pressable>
                }
            >
                <View style={styles.field}>
                    <Text style={styles.label}>Email or Phone</Text>
                    <Input
                        placeholder="example@gmail.com"
                        value={emailOrPhone}
                        onChangeText={setEmailOrPhone}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.field}>
                    <View style={styles.passwordRow}>
                        <Text style={styles.label}>Password</Text>
                        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
                            <Text style={styles.forgot}>Forgot?</Text>
                        </Pressable>
                    </View>

                    <PasswordInput
                        placeholder="Enter password"
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <Button
                    title={isPending ? "Logging in..." : "Login"}
                    onPress={handleLogin}
                />

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                <Pressable
                    onPress={() =>
                        Alert.alert(
                            "Google login unavailable",
                            "Google client authentication is not configured in this mobile build yet."
                        )
                    }
                    style={({ pressed }) => [styles.googleButton, pressed && styles.googlePressed]}
                >
                    <View style={styles.googleIconWrap}>
                        <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={styles.googleText}>Continue with Google</Text>
                </Pressable>
            </AuthScreen>
        </KeyboardWrapper>

    );
}

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: "center",
        marginBottom: 4,
    },
    logoImage: {
        width: 76,
        height: 76,
        marginBottom: 12,
    },
    logoText: {
        fontSize: 26,
        fontWeight: "800",
        color: "#ebbc01",
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0b2457",
    },
    passwordRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    forgot: {
        fontSize: 13,
        color: "#0b2457",
        fontWeight: "600",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#dbe7ff",
    },
    dividerText: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "700",
        letterSpacing: 1.2,
    },
    googleButton: {
        minHeight: 54,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        backgroundColor: "#f8fbff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingHorizontal: 18,
    },
    googlePressed: {
        opacity: 0.82,
    },
    googleIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    googleIcon: {
        fontSize: 18,
        fontWeight: "800",
        color: "#ea4335",
    },
    googleText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },
    signupContainer: {
        marginTop: 22,
        alignItems: "center",
    },
    signupText: {
        fontSize: 14,
        color: "#64748b",
    },
    signupHighlight: {
        color: "#0b2457",
        fontWeight: "700",
    },
});
