import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

function CenterTabButton({
    onPress,
    accessibilityState,
}: {
    onPress?: (...args: any[]) => void;
    accessibilityState?: { selected?: boolean };
}) {
    const selected = !!accessibilityState?.selected;

    return (
        <View style={styles.centerWrap}>
            <Pressable
                onPress={onPress}
                style={({ pressed }) => [
                    styles.centerBtn,
                    selected && styles.centerBtnActive,
                    pressed && styles.centerPressed,
                ]}
            >
                <Ionicons
                    name={selected ? "home" : "home-outline"}
                    color={selected ? "#ebbc01" : "#ffffff"}
                    size={24}
                />
            </Pressable>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: "#040947",
                tabBarInactiveTintColor: "#111827",

                tabBarStyle: {
                    height: 76,
                    paddingTop: 8,
                    paddingBottom: 10,
                    borderTopWidth: 0,
                    backgroundColor: "#ffffff",
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22,
                    elevation: 12,
                    shadowColor: "#040947",
                    shadowOpacity: 0.12,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: -3 },
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "700",
                },
            }}
        >
            {/* Requests */}
            <Tabs.Screen
                name="requests"
                options={{
                    title: "Requests",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "file-tray" : "file-tray-outline"}
                            color={color}
                            size={focused ? 23 : 21}
                        />
                    ),
                }}
            />

            {/* Alerts */}
            <Tabs.Screen
                name="notifications"
                options={{
                    title: "Alerts",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "notifications" : "notifications-outline"}
                            color={color}
                            size={focused ? 23 : 21}
                        />
                    ),
                }}
            />

            {/* Center Home */}
            <Tabs.Screen
                name="home"
                options={{
                    title: "",
                    tabBarLabel: "",
                    tabBarButton: (props) => <CenterTabButton {...props} />,
                }}
            />

            {/* Orders */}
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    popToTopOnBlur: true,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "receipt" : "receipt-outline"}
                            color={color}
                            size={focused ? 23 : 21}
                        />
                    ),
                }}
            />

            {/* Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            color={color}
                            size={focused ? 23 : 21}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    centerWrap: {
        top: -24,
        justifyContent: "center",
        alignItems: "center",
    },
    centerBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#040947",
        borderWidth: 3,
        borderColor: "#ffffff",
        shadowColor: "#040947",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        alignItems: "center",
        justifyContent: "center",
        elevation: 12,
    },
    centerBtnActive: {
        backgroundColor: "#040947",
        transform: [{ scale: 1.03 }],
    },
    centerPressed: {
        transform: [{ scale: 0.96 }],
    },
});
