import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import AuthScreen from "../../components/ui/AuthScreen";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";

import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import { useAppTheme } from "@/contexts/ThemeContext";
import { extractErrorMessage, isEmailNotVerifiedError } from "@/services/auth/auth-error";
import { useLogin } from "../../hooks/auth/useLogin";
import { LoginRequest } from "../../types/auth/login";
import { useTranslation } from "react-i18next";
import { NEPAL_PHONE_HELPER_TEXT, sanitizePhoneInput } from "@/utils/validation";

export default function LoginScreen() {
    const { mutate, isPending } = useLogin();
    const { theme } = useAppTheme();
    const { t } = useTranslation();

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

                Alert.alert(t("auth.loginFailed"), extractErrorMessage(err));
            },
        });
    };

    return (
        <KeyboardWrapper>
            <AuthScreen
                title={t("auth.welcomeBack")}
                subtitle={t("auth.welcomeSubtitle")}
                header={
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../../assets/logo.png")}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={[styles.logoText, { color: theme.accent }]}>Dhune.np</Text>
                    </View>
                }
                footer={
                    <Pressable
                        style={styles.signupContainer}
                        onPress={() => router.replace("/(auth)/signup")}
                    >
                        <Text style={[styles.signupText, { color: theme.textMuted }]}>
                            {t("auth.dontHaveAccount")}{" "}
                            <Text style={[styles.signupHighlight, { color: theme.primary }]}>{t("auth.signUp")}</Text>
                        </Text>
                    </Pressable>
                }
            >
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.primary }]}>{t("auth.emailOrPhone")}</Text>
                    <Input
                        placeholder="example@gmail.com"
                        value={emailOrPhone}
                        onChangeText={(value) => setEmailOrPhone(/^\d+$/.test(value) ? sanitizePhoneInput(value) : value)}
                        autoCapitalize="none"
                    />
                    <Text style={[styles.helper, { color: theme.textMuted }]}>Phone login: +977 98XXXXXXXX. {NEPAL_PHONE_HELPER_TEXT}</Text>
                </View>

                <View style={styles.field}>
                    <View style={styles.passwordRow}>
                        <Text style={[styles.label, { color: theme.primary }]}>{t("common.password")}</Text>
                        <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
                            <Text style={[styles.forgot, { color: theme.primary }]}>{t("auth.forgot")}</Text>
                        </Pressable>
                    </View>

                    <PasswordInput
                        placeholder={t("auth.enterPassword")}
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <Button
                    title={isPending ? t("auth.loggingIn") : t("auth.login")}
                    onPress={handleLogin}
                />

                <View style={styles.dividerRow}>
                    <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                    <Text style={[styles.dividerText, { color: theme.textMuted }]}>{t("auth.or")}</Text>
                    <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                </View>

                <Pressable
                    onPress={() =>
                        Alert.alert(
                            t("auth.googleLoginUnavailable"),
                            t("auth.googleLoginUnavailableMessage")
                        )
                    }
                    style={({ pressed }) => [
                        styles.googleButton,
                        {
                            backgroundColor: theme.surfaceMuted,
                            borderColor: theme.border,
                        },
                        pressed && styles.googlePressed,
                    ]}
                >
                    <View style={[styles.googleIconWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={styles.googleIcon}>G</Text>
                    </View>
                    <Text style={[styles.googleText, { color: theme.text }]}>{t("auth.continueWithGoogle")}</Text>
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
    },
    field: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "700",
    },
    passwordRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    forgot: {
        fontSize: 13,
        fontWeight: "600",
    },
    helper: {
        fontSize: 11,
        fontWeight: "500",
    },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.2,
    },
    googleButton: {
        minHeight: 54,
        borderRadius: 14,
        borderWidth: 1,
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
        borderWidth: 1,
    },
    googleIcon: {
        fontSize: 18,
        fontWeight: "800",
        color: "#ea4335",
    },
    googleText: {
        fontSize: 15,
        fontWeight: "700",
    },
    signupContainer: {
        marginTop: 22,
        alignItems: "center",
    },
    signupText: {
        fontSize: 14,
    },
    signupHighlight: {
        fontWeight: "700",
    },
});
