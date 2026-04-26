import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

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
            Alert.alert("Reset link sent", `Password reset instructions were sent to ${trimmedEmail}.`);
        } catch {
            Alert.alert("Request failed", "Please try again.");
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <Pressable style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="#040947" />
                <Text style={styles.backText}>Back</Text>
            </Pressable>

            <View style={styles.container}>
                <View style={styles.card}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your registered email address to receive a password reset link.
                    </Text>

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
                        title={forgotPassword.isPending ? "Sending..." : "Send Reset Link"}
                        onPress={handleSubmit}
                    />
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
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#040947",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
        lineHeight: 21,
        marginBottom: 18,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
    },
});
