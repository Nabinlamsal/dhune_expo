import { useAppTheme } from "@/contexts/ThemeContext";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

export default function Input(props: TextInputProps) {
    const { theme } = useAppTheme();

    return (
        <TextInput
            {...props}
            style={[
                styles.input,
                {
                    borderColor: theme.inputBorder,
                    backgroundColor: theme.inputBackground,
                    color: theme.inputText,
                },
                props.style,
            ]}
            placeholderTextColor={theme.inputPlaceholder}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
    },
});
