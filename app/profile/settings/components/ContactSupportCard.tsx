import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ContactSupportCardProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    caption: string;
    onPress: () => void;
    colors: {
        card: string;
        border: string;
        text: string;
        textMuted: string;
        primary: string;
        primarySoft: string;
    };
};

export default function ContactSupportCard({
    icon,
    title,
    value,
    caption,
    onPress,
    colors,
}: ContactSupportCardProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                },
                pressed && styles.pressed,
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.copy}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.value, { color: colors.primary }]}>{value}</Text>
                <Text style={[styles.caption, { color: colors.textMuted }]}>{caption}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    copy: {
        flex: 1,
    },
    title: {
        fontSize: 13,
        fontWeight: "700",
    },
    value: {
        marginTop: 3,
        fontSize: 14,
        fontWeight: "800",
    },
    caption: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: "500",
    },
    pressed: {
        opacity: 0.86,
    },
});
