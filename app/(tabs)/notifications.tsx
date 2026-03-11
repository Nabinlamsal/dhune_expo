import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const mockNotifications = [
    { id: "n1", title: "Order update", body: "Your order is now in progress." },
    { id: "n2", title: "Bid received", body: "A vendor placed a bid on your request." },
    { id: "n3", title: "Payment reminder", body: "Please complete pending payment." },
];

export default function NotificationsScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {mockNotifications.map((item) => (
                    <View style={styles.card} key={item.id}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="notifications-outline" size={18} color="#040947" />
                        </View>
                        <View style={styles.body}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.body}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    scroll: {
        padding: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ebbc0115",
        marginRight: 10,
    },
    body: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        color: "#6b7280",
        lineHeight: 18,
    },
});
