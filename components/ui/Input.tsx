import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function Input(props: TextInputProps) {
    return (
        <TextInput
            {...props}
            style={[styles.input, props.style]}
            placeholderTextColor="#9ca3af"
        />
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        backgroundColor: "white",
    },
});