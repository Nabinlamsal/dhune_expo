import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
    ViewStyle,
} from "react-native";

type PasswordInputProps = TextInputProps & {
    containerStyle?: StyleProp<ViewStyle>;
};

export default function PasswordInput({
    containerStyle,
    style,
    ...props
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            <TextInput
                {...props}
                style={[styles.input, style]}
                placeholderTextColor="#9ca3af"
                secureTextEntry={!visible}
            />
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={visible ? "Hide password" : "Show password"}
                hitSlop={8}
                onPress={() => setVisible((current) => !current)}
                style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            >
                <Ionicons
                    name={visible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748b"
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 50,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        paddingRight: 6,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        color: "#0f172a",
    },
    iconButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    iconButtonPressed: {
        backgroundColor: "#f1f5f9",
    },
});
