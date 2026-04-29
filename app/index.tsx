import { getAuthSession } from "@/services/auth/session.service";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet } from "react-native";

export default function Index() {
    const [target, setTarget] = useState<string | null>(null);

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
            <SafeAreaView style={styles.loading}>
                <ActivityIndicator size="large" color="#040947" />
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
        backgroundColor: "#f4f8ff",
    },
});
