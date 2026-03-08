import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: "primary" | "secondary";
}

export default function Button({ title, onPress, variant = "primary" }: ButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.button,
                variant === "primary" ? styles.primary : styles.secondary,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    variant === "primary" ? styles.primaryText : styles.secondaryText,
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

    primary: {
        backgroundColor: "#040947",
    },

    secondary: {
        backgroundColor: "#6187c2",
    },

    text: {
        fontSize: 16,
        fontWeight: "600",
    },

    primaryText: {
        color: "white",
    },

    secondaryText: {
        color: "white",
    },
});