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
                    resizeMode="contain"
                />
            </View>

            {/* Text */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>Welcome to Dhune.np</Text>
                <Text style={styles.subtitle}>
                    Find trusted laundry vendors near you and schedule your laundry pickup easily.
                </Text>
            </View>

            {/* Button */}
            <Pressable
                style={styles.button}
                onPress={() => router.push("/(onboarding)/get-started")}
            >
                <Text style={styles.buttonText}>Next</Text>
            </Pressable>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 20,
    },

    imageContainer: {
        alignItems: "center",
        paddingTop: 5,
        marginVertical: 30,
    },

    image: {
        width: "90%",
        height: 250,
    },

    textContainer: {
        alignItems: "center",
        paddingHorizontal: 20,
        // marginVertical: 30,
        paddingBottom: 30,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#040947",
        textAlign: "center",
        marginBottom: 15,
    },

    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
    },

    button: {
        backgroundColor: "#040947",
        paddingVertical: 14,
        marginHorizontal: 20,
        marginVertical: 40,
        borderRadius: 10,
        alignItems: "center",
    },

    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
});
