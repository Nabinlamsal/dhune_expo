import { useAppTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

export const unstable_settings = {
    initialRouteName: "home",
};

function CenterTabButton({
    onPress,
    accessibilityState,
}: {
    onPress?: (...args: any[]) => void;
    accessibilityState?: { selected?: boolean };
}) {
    const selected = !!accessibilityState?.selected;
    const { theme } = useAppTheme();

    return (
        <View style={styles.centerWrap}>
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Create request"
                style={({ pressed }) => [
                    styles.centerBtn,
                    {
                        backgroundColor: theme.accent,
                        borderColor: theme.mode === "dark" ? theme.primaryContrast : theme.accent,
                        shadowColor: theme.shadow,
                    },
                    selected && styles.centerBtnActive,
                    pressed && styles.centerPressed,
                ]}
            >
                <Ionicons
                    name="add"
                    color={theme.mode === "dark" ? theme.background : theme.primaryContrast}
                    size={31}
                />
            </Pressable>
        </View>
    );
}

export default function TabsLayout() {
    const { theme } = useAppTheme();

    return (
        <Tabs
            initialRouteName="home"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.tabBarActive,
                tabBarInactiveTintColor: theme.tabBarInactive,
                tabBarStyle: {
                    height: 76,
                    paddingTop: 8,
                    paddingBottom: 10,
                    borderTopWidth: 0,
                    backgroundColor: theme.tabBarBackground,
                    elevation: 12,
                    shadowColor: theme.shadow,
                    shadowOpacity: theme.mode === "dark" ? 0.35 : 0.12,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: -3 },
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "700",
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            color={color}
                            size={focused ? 23 : 21}
                        />
                    ),
                }}
            />
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

            <Tabs.Screen
                name="requests/create"
                options={{
                    title: "",
                    tabBarLabel: () => null,
                    tabBarButton: (props) => (
                        <CenterTabButton {...props} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? "add" : "add"}
                            color="white"
                            size={30}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="notifications"
                options={{
                    href: null,
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
        top: -22,
        justifyContent: "center",
        alignItems: "center",
    },
    centerBtn: {
        width: 53,
        height: 53,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    centerBtnActive: {
        transform: [{ scale: 1.03 }],
    },
    centerPressed: {
        transform: [{ scale: 0.96 }],
    },
});
