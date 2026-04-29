import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function GetStartedScreen() {
    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Reliable pickup and delivery</Text>
                </View>
            </View>

            <View style={styles.textSection}>
                <Text style={styles.title}>Get Started</Text>
                <Text style={styles.subtitle}>
                    Continue with your account or create a new one to request service, compare vendors, and track every order.
                </Text>
            </View>

            <View style={styles.buttons}>
                <Pressable
                    style={styles.loginButton}
                    onPress={() => router.replace("/(auth)/login")}
                >
                    <Ionicons name="log-in-outline" size={20} color="white" />
                    <Text style={styles.loginText}>Login</Text>
                </Pressable>

                <Pressable
                    style={styles.signupButton}
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
        backgroundColor: "#f4f8ff",
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
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0b2457",
    },
    textSection: {
        alignItems: "center",
        marginBottom: 42,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#040947",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748b",
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
        backgroundColor: "#040947",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    signupButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ebbc01",
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    loginText: {
        color: "white",
        fontSize: 17,
        fontWeight: "700",
    },
    signupText: {
        color: "#0b2457",
        fontSize: 17,
        fontWeight: "700",
    },
});
