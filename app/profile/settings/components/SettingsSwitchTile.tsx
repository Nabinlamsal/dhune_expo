import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";

type SettingsSwitchTileProps = {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
    colors: {
        card: string;
        border: string;
        text: string;
        textMuted: string;
        primary: string;
        primarySoft: string;
        switchTrackOn: string;
        switchTrackOff: string;
        switchThumb: string;
        switchThumbDisabled: string;
    };
};

export default function SettingsSwitchTile({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
    disabled = false,
    colors,
}: SettingsSwitchTileProps) {
    return (
        <View
            style={[
                styles.tile,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: disabled ? 0.72 : 1,
                },
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.copy}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
                trackColor={{
                    false: colors.switchTrackOff,
                    true: colors.switchTrackOn,
                }}
                thumbColor={disabled ? colors.switchThumbDisabled : colors.switchThumb}
                ios_backgroundColor={colors.switchTrackOff}
            />
        </View>
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
});
