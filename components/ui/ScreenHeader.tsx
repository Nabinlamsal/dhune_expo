import { useAppTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

type ScreenHeaderProps = {
    title: string;
    subtitle?: string;
    backHref?: string;
    rightSlot?: ReactNode;
};

export default function ScreenHeader({
    title,
    subtitle,
    backHref,
    rightSlot,
}: ScreenHeaderProps) {
    const { theme } = useAppTheme();

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                <View style={styles.titleRow}>
                    {backHref ? (
                        <Pressable
                            onPress={() => router.replace(backHref as any)}
                            style={({ pressed }) => [
                                styles.backButton,
                                {
                                    backgroundColor: theme.card,
                                    borderColor: theme.border,
                                },
                                pressed && styles.pressed,
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                        >
                            <Ionicons name="chevron-back" size={16} color={theme.primary} />
                        </Pressable>
                    ) : null}
                    <View style={styles.copy}>
                        <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
                        {subtitle ? (
                            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
                        ) : null}
                    </View>
                </View>
                {rightSlot ? <View>{rightSlot}</View> : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginBottom: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    backButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbe7ff",
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: {
        opacity: 0.86,
    },
    copy: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: "600",
    },
});
