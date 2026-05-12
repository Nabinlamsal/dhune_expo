import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SettingsOptionTileProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label?: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    tone?: "default" | "danger";
    trailing?: "chevron" | "none";
    colors: {
        card: string;
        border: string;
        text: string;
        textMuted: string;
        primary: string;
        primarySoft: string;
        danger: string;
        dangerSoft: string;
    };
};

export default function SettingsOptionTile({
    icon,
    label,
    title,
    subtitle,
    onPress,
    tone = "default",
    trailing = "chevron",
    colors,
}: SettingsOptionTileProps) {
    const accent = tone === "danger" ? colors.danger : colors.primary;
    const accentSoft = tone === "danger" ? colors.dangerSoft : colors.primarySoft;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.tile,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                },
                pressed && styles.pressed,
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: accentSoft }]}>
                <Ionicons name={icon} size={18} color={accent} />
            </View>
            <View style={styles.copy}>
                {label ? <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text> : null}
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            </View>
            {trailing === "chevron" ? (
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 13,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconWrap: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
    },
    copy: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: 0.45,
        fontWeight: "700",
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: "800",
    },
    subtitle: {
        marginTop: 3,
        fontSize: 11,
        lineHeight: 17,
        fontWeight: "500",
    },
    pressed: {
        opacity: 0.86,
    },
});
