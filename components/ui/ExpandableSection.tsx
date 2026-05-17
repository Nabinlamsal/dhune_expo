import { useAppTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from "react-native";

const ACTION_BG = "#0b2457";

type ExpandableSectionProps = {
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    children: ReactNode;
    defaultExpanded?: boolean;
    summary?: string;
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ExpandableSection({
    title,
    icon = "chevron-forward",
    children,
    defaultExpanded = false,
    summary,
}: ExpandableSectionProps) {
    const { theme } = useAppTheme();
    const [expanded, setExpanded] = useState(defaultExpanded);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((current) => !current);
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
            <Pressable style={styles.header} onPress={toggleExpanded}>
                <View style={[styles.iconWrap, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name={icon} size={18} color={theme.primary} />
                </View>
                <View style={styles.copy}>
                    <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                    {summary ? (
                        <Text style={[styles.summary, { color: theme.textMuted }]} numberOfLines={1}>
                            {summary}
                        </Text>
                    ) : null}
                </View>
                <View style={[styles.chevronWrap, { backgroundColor: expanded ? ACTION_BG : theme.surfaceMuted }]}>
                    <Ionicons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={expanded ? "#ffffff" : theme.primary}
                    />
                </View>
            </Pressable>
            {expanded ? <View style={[styles.body, { borderTopColor: theme.border }]}>{children}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
        overflow: "hidden",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
    },
    header: {
        minHeight: 62,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    copy: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: "800",
    },
    summary: {
        marginTop: 3,
        fontSize: 12,
        fontWeight: "500",
    },
    chevronWrap: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    body: {
        borderTopWidth: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 4,
    },
});
