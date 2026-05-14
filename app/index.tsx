import { getAuthSession } from "@/services/auth/session.service";
import { useAppTheme } from "@/contexts/ThemeContext";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";

export default function Index() {
    const [target, setTarget] = useState<string | null>(null);
    const { theme } = useAppTheme();

    useEffect(() => {
        let active = true;

        void getAuthSession().then((session) => {
            if (!active) return;
            setTarget(session?.token ? "/(tabs)/home" : "/(onboarding)/welcome");
        });

        return () => {
            active = false;
        };
    }, []);

    if (!target) {
        return (
            <SafeAreaView style={[styles.loading, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </SafeAreaView>
        );
    }

    return <Redirect href={target as any} />;
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
