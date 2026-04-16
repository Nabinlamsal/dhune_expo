import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNotifications } from "@/hooks/notifications/useNotifications";

export default function NotificationButton() {
    const { unreadCount } = useNotifications();

    return (
        <Pressable
            onPress={() => router.push("/(tabs)/notifications")}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
        >
            <Ionicons name="notifications-outline" size={20} color="#040947" />
            {unreadCount > 0 ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    pressed: {
        opacity: 0.85,
    },
    badge: {
        position: "absolute",
        top: -3,
        right: -3,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#dc2626",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: "#ffffff",
    },
    badgeText: {
        color: "#ffffff",
        fontSize: 9,
        fontWeight: "800",
    },
});
