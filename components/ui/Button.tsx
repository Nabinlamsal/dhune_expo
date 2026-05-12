import { useAppTheme } from "@/contexts/ThemeContext";
import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: "primary" | "secondary";
}

export default function Button({ title, onPress, variant = "primary" }: ButtonProps) {
    const { theme } = useAppTheme();

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.button,
                {
                    backgroundColor: variant === "primary" ? theme.primary : theme.borderStrong,
                },
                pressed && styles.pressed,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    { color: variant === "primary" ? theme.primaryContrast : theme.text },
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },

    text: {
        fontSize: 16,
        fontWeight: "600",
    },
    pressed: {
        opacity: 0.88,
    },
});
