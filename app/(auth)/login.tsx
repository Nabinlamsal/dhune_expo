import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

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
            },
        });
    };

    return (
        <SafeAreaView style={styles.safe}>

            {/* Back Button */}
            <Pressable style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="#040947" />
                <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.container}>

                {/* Card */}
                <View style={styles.card}>

                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../../assets/logo.png")}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.logoText}>Dhune.np</Text>
                        <Text style={styles.subtitle}>Login to your account</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>

                        <View style={styles.field}>
                            <Text style={styles.label}>Email or Phone</Text>
                            <Input
                                placeholder="example@gmail.com"
                                value={emailOrPhone}
                                onChangeText={setEmailOrPhone}
                            />
                        </View>

                        <View style={styles.field}>
                            <View style={styles.passwordRow}>
                                <Text style={styles.label}>Password</Text>
                                <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
                                    <Text style={styles.forgot}>Forgot?</Text>
                                </Pressable>
                            </View>

                            <Input
                                placeholder="Enter password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {/* Login */}
                        <Button
                            title={isPending ? "Logging in..." : "Login"}
                            onPress={handleLogin}
                        />

                        {/* Google Login */}
                        <Button
                            title="Login with Google"
                            variant="secondary"
                            onPress={() =>
                                Alert.alert(
                                    "Google login unavailable",
                                    "Google client authentication is not configured in this mobile build yet."
                                )
                            }
                        />

                        {/* Signup */}
                        <Pressable
                            style={styles.signupContainer}
                            onPress={() => router.replace("/(auth)/signup")}
                        >
                            <Text style={styles.signupText}>
                                Don&apos;t have an account?{" "}
                                <Text style={styles.signupHighlight}>Sign Up</Text>
                            </Text>
                        </Pressable>

                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    safe: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },

    back: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
    },

    backText: {
        marginLeft: 6,
        fontSize: 16,
        color: "#040947",
        fontWeight: "500",
    },

    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 26,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },

    logoContainer: {
        alignItems: "center",
        marginBottom: 26,
    },

    logoImage: {
        width: 70,
        height: 70,
        marginBottom: 10,
    },

    logoText: {
        fontSize: 26,
        fontWeight: "700",
        color: "#ebbc01",
    },

    subtitle: {
        fontSize: 15,
        color: "#040947",
        marginTop: 4,
    },

    form: {
        gap: 18,
    },

    field: {
        gap: 6,
    },

    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },

    passwordRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    forgot: {
        fontSize: 13,
        color: "#040947",
    },

    signupContainer: {
        marginTop: 10,
        alignItems: "center",
    },

    signupText: {
        fontSize: 14,
        color: "#6b7280",
    },

    signupHighlight: {
        color: "#040947",
        fontWeight: "600",
    },
});
