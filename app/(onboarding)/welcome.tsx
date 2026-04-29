import { router } from "expo-router";
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
    return (
        <SafeAreaView style={styles.container}>

            {/* Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={require("../../assets/card.jpg")}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.eyebrow}>Smart Laundry Workflow</Text>
                <Text style={styles.title}>Welcome to Dhune.np</Text>
                <Text style={styles.subtitle}>
                    Discover trusted laundry vendors, compare offers, and schedule pickups without back-and-forth calls.
                </Text>
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>What you can do here</Text>
                    <Text style={styles.infoText}>Request pickup in minutes.</Text>
                    <Text style={styles.infoText}>Track every order from collection to delivery.</Text>
                    <Text style={styles.infoText}>Stay informed with real-time status updates.</Text>
                </View>
            </View>

            <Pressable
                style={styles.button}
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
        backgroundColor: "#f4f8ff",
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    imageContainer: {
        marginTop: 12,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
        shadowColor: "#0b2457",
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
        color: "#0b2457",
        fontWeight: "800",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#040947",
        textAlign: "center",
        marginBottom: 14,
    },
    subtitle: {
        fontSize: 16,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 24,
    },
    infoCard: {
        width: "100%",
        marginTop: 22,
        padding: 18,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
        gap: 8,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#0b2457",
        marginBottom: 2,
    },
    infoText: {
        fontSize: 14,
        color: "#475569",
        lineHeight: 20,
    },
    button: {
        backgroundColor: "#040947",
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
