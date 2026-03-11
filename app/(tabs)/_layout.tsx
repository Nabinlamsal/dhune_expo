import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import NotificationButton from "../../components/ui/NotificationButton";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                headerTitleStyle: {
                    color: "#040947",
                    fontWeight: "700",
                },
                headerStyle: {
                    backgroundColor: "#f5f6fa",
                },
                headerShadowVisible: false,
                headerRight: () => <NotificationButton />,
                tabBarActiveTintColor: "#040947",
                tabBarInactiveTintColor: "#6b7280",
                tabBarStyle: {
                    height: 64,
                    paddingTop: 8,
                    paddingBottom: 10,
                    borderTopWidth: 0,
                },
                tabBarItemStyle: {
                    marginHorizontal: 4,
                    borderRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="requests"
                options={{
                    title: "Requests",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="file-tray-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
