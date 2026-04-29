import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

type AuthScreenProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
    showBackButton?: boolean;
    onBackPress?: () => void;
    scrollable?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
};

function AuthCardLayout({
    title,
    subtitle,
    children,
    header,
    footer,
    showBackButton,
    onBackPress,
    contentContainerStyle,
}: Omit<AuthScreenProps, "scrollable">) {
    return (
        <View style={styles.contentWrap}>
            {showBackButton ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onBackPress}
                    style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                >
                    <Ionicons name="arrow-back" size={20} color="#0b2457" />
                    <Text style={styles.backText}>Back</Text>
                </Pressable>
            ) : null}

            <View style={[styles.card, contentContainerStyle]}>
                {header}
                <View style={styles.copyBlock}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
                <View style={styles.body}>{children}</View>
                {footer}
            </View>
        </View>
    );
}

export default function AuthScreen({
    title,
    subtitle,
    children,
    header,
    footer,
    showBackButton = false,
    onBackPress,
    scrollable = false,
    contentContainerStyle,
}: AuthScreenProps) {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.bgTop} />
            <View style={styles.bgBottom} />
            {scrollable ? (
                <ScrollView
                    bounces={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <AuthCardLayout
                        title={title}
                        subtitle={subtitle}
                        header={header}
                        footer={footer}
                        showBackButton={showBackButton}
                        onBackPress={onBackPress}
                        contentContainerStyle={contentContainerStyle}
                    >
                        {children}
                    </AuthCardLayout>
                </ScrollView>
            ) : (
                <AuthCardLayout
                    title={title}
                    subtitle={subtitle}
                    header={header}
                    footer={footer}
                    showBackButton={showBackButton}
                    onBackPress={onBackPress}
                    contentContainerStyle={contentContainerStyle}
                >
                    {children}
                </AuthCardLayout>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#f4f8ff",
    },
    bgTop: {
        position: "absolute",
        top: -120,
        right: -40,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: "#dbe7ff",
    },
    bgBottom: {
        position: "absolute",
        bottom: -80,
        left: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: "#fceec0",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 22,
        paddingVertical: 20,
    },
    contentWrap: {
        flex: 1,
        justifyContent: "center",
    },
    backButton: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 14,
        paddingHorizontal: 4,
        paddingVertical: 6,
    },
    backButtonPressed: {
        opacity: 0.7,
    },
    backText: {
        fontSize: 15,
        color: "#0b2457",
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#dbe7ff",
        paddingHorizontal: 24,
        paddingVertical: 28,
        shadowColor: "#0b2457",
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
    },
    copyBlock: {
        marginBottom: 22,
    },
    title: {
        fontSize: 30,
        fontWeight: "800",
        color: "#040947",
    },
    subtitle: {
        marginTop: 8,
        fontSize: 15,
        lineHeight: 23,
        color: "#64748b",
    },
    body: {
        gap: 16,
    },
});
