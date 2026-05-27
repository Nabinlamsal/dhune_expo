import { ReactNode } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ScrollViewProps,
    StyleProp,
    ViewStyle,
    TouchableWithoutFeedback,
} from "react-native";

type Props = {
    children: ReactNode;
    contentContainerStyle?: StyleProp<ViewStyle>;
    keyboardVerticalOffset?: number;
    dismissOnTap?: boolean;
    scrollViewProps?: Omit<ScrollViewProps, "contentContainerStyle" | "keyboardShouldPersistTaps">;
    style?: StyleProp<ViewStyle>;
};

export default function KeyboardWrapper({
    children,
    contentContainerStyle,
    keyboardVerticalOffset = 0,
    dismissOnTap = true,
    scrollViewProps,
    style,
}: Props) {
    const scrollView = (
        <ScrollView
            {...scrollViewProps}
            contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
        >
            {children}
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView
            style={[{ flex: 1 }, style]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={keyboardVerticalOffset}
        >
            {dismissOnTap ? (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    {scrollView}
                </TouchableWithoutFeedback>
            ) : (
                scrollView
            )}
        </KeyboardAvoidingView>
    );
}
