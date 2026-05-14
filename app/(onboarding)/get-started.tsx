import { useAppTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function GetStartedScreen() {
    const { theme } = useAppTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={[styles.badge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>Reliable pickup and delivery</Text>
                </View>
            </View>

            <View style={styles.textSection}>
                <Text style={[styles.title, { color: theme.mode === "dark" ? theme.text : "#040947" }]}>Get Started</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Continue with your account or create a new one to request service, compare vendors, and track every order.
                </Text>
            </View>

            <View style={styles.buttons}>
                <Pressable
                    style={[styles.loginButton, { backgroundColor: theme.mode === "dark" ? theme.primary : "#040947" }]}
                    onPress={() => router.replace("/(auth)/login")}
                >
                    <Ionicons name="log-in-outline" size={20} color={theme.primaryContrast} />
                    <Text style={[styles.loginText, { color: theme.primaryContrast }]}>Login</Text>
                </Pressable>

                <Pressable
                    style={[styles.signupButton, { backgroundColor: theme.accent }]}
                    onPress={() => router.replace("/(auth)/signup")}
                >
                    <Ionicons name="person-add-outline" size={20} color="#0b2457" />
                    <Text style={styles.signupText}>Create Account</Text>
                </Pressable>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: "center",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 34,
    },
    logo: {
        width: 120,
        height: 120,
    },
    badge: {
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
    },
    textSection: {
        alignItems: "center",
        marginBottom: 42,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    buttons: {
        width: "100%",
        gap: 14,
    },
    loginButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    signupButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    loginText: {
        fontSize: 17,
        fontWeight: "700",
    },
    signupText: {
        color: "#0b2457",
        fontSize: 17,
        fontWeight: "700",
    },
});
