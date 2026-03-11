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
                    color={selected ? "#ebbc01" : "#111827"}
                    size={26}
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
                    height: 70,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderTopWidth: 0,
                    backgroundColor: "#ffffff",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    elevation: 10,
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
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#ebbc01",
        shadowOpacity: 0.8,
        shadowRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        elevation: 10,
    },
    centerBtnActive: {
        backgroundColor: "#040947",
    },
    centerPressed: {
        transform: [{ scale: 0.96 }],
    },
});
