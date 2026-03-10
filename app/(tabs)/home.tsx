import { Ionicons } from "@expo/vector-icons";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Welcome */}
                <View style={styles.header}>
                    <Text style={styles.welcome}>Welcome to</Text>
                    <Text style={styles.brand}>Dhune.np</Text>
                </View>

                {/* Quick Action */}
                <Pressable style={styles.createRequest}>
                    <Ionicons name="add-circle-outline" size={26} color="#fff" />
                    <Text style={styles.createText}>Create Laundry Request</Text>
                </Pressable>

                {/* Stats Section */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Active Requests</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>2</Text>
                        <Text style={styles.statLabel}>Orders</Text>
                    </View>
                </View>

                {/* Recent Requests */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Requests</Text>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Laundry Pickup</Text>
                        <Text style={styles.cardSubtitle}>Waiting for vendor offers</Text>
                    </View>
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Order #1023</Text>
                        <Text style={styles.cardSubtitle}>In progress</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingHorizontal: 20,
    },

    header: {
        marginTop: 20,
        marginBottom: 20,
    },

    welcome: {
        fontSize: 18,
        color: "#6b7280",
    },

    brand: {
        fontSize: 28,
        fontWeight: "700",
        color: "#040947",
    },

    createRequest: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#040947",
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 25,
        gap: 8,
    },

    createText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },

    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        marginHorizontal: 5,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },

    statNumber: {
        fontSize: 22,
        fontWeight: "700",
        color: "#040947",
    },

    statLabel: {
        fontSize: 13,
        color: "#6b7280",
    },

    section: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        color: "#040947",
    },

    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
    },

    cardSubtitle: {
        fontSize: 13,
        color: "#6b7280",
    },
});