import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Profile</Text>
                <Text style={styles.subtitle}>Coming soon</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
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
    },
});
