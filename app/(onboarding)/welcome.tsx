import { useAppTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
    const { theme } = useAppTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>

            {/* Image */}
            <View style={[styles.imageContainer, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
                <Image
                    source={require("../../assets/card.jpg")}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.eyebrow, { color: theme.primary }]}>Smart Laundry Workflow</Text>
                <Text style={[styles.title, { color: theme.mode === "dark" ? theme.text : "#040947" }]}>Welcome to Dhune.np</Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Discover trusted laundry vendors, compare offers, and schedule pickups without back-and-forth calls.
                </Text>
                <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.infoTitle, { color: theme.primary }]}>What you can do here</Text>
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>Request pickup in minutes.</Text>
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>Track every order from collection to delivery.</Text>
                    <Text style={[styles.infoText, { color: theme.textMuted }]}>Stay informed with real-time status updates.</Text>
                </View>
            </View>

            <Pressable
                style={[styles.button, { backgroundColor: theme.mode === "dark" ? theme.primary : "#040947" }]}
                onPress={() => router.replace("/(onboarding)/get-started")}
            >
                <Text style={styles.buttonText}>Continue</Text>
            </Pressable>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    imageContainer: {
        marginTop: 12,
        borderRadius: 28,
        overflow: "hidden",
        borderWidth: 1,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5,
    },
    image: {
        width: "100%",
        height: 280,
    },
    textContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingTop: 30,
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 14,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
    },
    infoCard: {
        width: "100%",
        marginTop: 22,
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: "800",
        marginBottom: 2,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 18,
    },
    buttonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "700",
    },
});
