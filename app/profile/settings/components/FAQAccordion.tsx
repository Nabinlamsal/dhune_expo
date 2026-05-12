import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type FAQAccordionProps = {
    question: string;
    answer: string;
    expanded: boolean;
    onPress: () => void;
    colors: {
        card: string;
        surfaceMuted: string;
        border: string;
        text: string;
        textMuted: string;
        primary: string;
        primaryContrast: string;
    };
};

export default function FAQAccordion({
    question,
    answer,
    expanded,
    onPress,
    colors,
}: FAQAccordionProps) {
    return (
        <View
            style={[
                styles.wrap,
                {
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                },
            ]}
        >
            <Pressable style={styles.header} onPress={onPress}>
                <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
                <View
                    style={[
                        styles.chevron,
                        {
                            backgroundColor: expanded ? colors.primary : colors.card,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Ionicons
                        name={expanded ? "remove" : "add"}
                        size={16}
                        color={expanded ? colors.primaryContrast : colors.primary}
                    />
                </View>
            </Pressable>
            {expanded ? (
                <View style={[styles.body, { borderTopColor: colors.border }]}>
                    <Text style={[styles.answer, { color: colors.textMuted }]}>{answer}</Text>
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        borderWidth: 1,
        borderRadius: 16,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
    },
    question: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
        lineHeight: 20,
    },
    chevron: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    body: {
        borderTopWidth: 1,
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingTop: 2,
    },
    answer: {
        fontSize: 12,
        lineHeight: 19,
        fontWeight: "500",
    },
});
