import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function GetStartedScreen() {
    return (
        <SafeAreaView style={styles.container}>

            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Title Section */}
            <View style={styles.textSection}>
                <Text style={styles.title}>Get Started</Text>
                <Text style={styles.subtitle}>
                    Login to your account or create a new one to start using Dhune.
                </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>

                <Pressable
                    style={styles.loginButton}
                    onPress={() => router.push("/(auth)/login")}
                >
                    <Ionicons name="log-in-outline" size={20} color="white" />
                    <Text style={styles.loginText}>Login</Text>
                </Pressable>

                <Pressable
                    style={styles.signupButton}
                    onPress={() => router.push("/(auth)/signup")}
                >
                    <Ionicons name="person-add-outline" size={20} color="white" />
                    <Text style={styles.signupText}>Create Account</Text>
                </Pressable>

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingHorizontal: 28,
        justifyContent: "center",
    },

    logoContainer: {
        alignItems: "center",
        marginBottom: 40,
    },

    logo: {
        width: 120,
        height: 120,
    },

    textSection: {
        alignItems: "center",
        marginBottom: 50,
    },

    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#040947",
        marginBottom: 10,
    },

    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 22,
    },

    buttons: {
        width: "100%",
    },

    loginButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#040947",
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 16,
        gap: 10,
    },

    signupButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#14b8c4",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 10,
    },

    loginText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },

    signupText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },
});
