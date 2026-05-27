import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/contexts/ThemeContext";
import KeyboardWrapper from "@/components/ui/KeyboardWrapper";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
    Pressable,
    SafeAreaView,
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
    const { theme } = useAppTheme();
    const { t } = useTranslation();

    return (
        <View style={styles.contentWrap}>
            {showBackButton ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onBackPress}
                    style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                >
                    <Ionicons name="arrow-back" size={20} color={theme.primary} />
                    <Text style={[styles.backText, { color: theme.primary }]}>{t("common.back")}</Text>
                </Pressable>
            ) : null}

            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        shadowColor: theme.shadow,
                    },
                    contentContainerStyle,
                ]}
            >
                {header}
                <View style={styles.copyBlock}>
                    <Text style={[styles.title, { color: theme.mode === "dark" ? theme.text : "#040947" }]}>
                        {title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
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
    const { theme } = useAppTheme();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <View style={[styles.bgTop, { backgroundColor: theme.primarySoft, opacity: theme.mode === "dark" ? 0.45 : 1 }]} />
            <View style={[styles.bgBottom, { backgroundColor: theme.accentSoft, opacity: theme.mode === "dark" ? 0.8 : 1 }]} />
            {scrollable ? (
                <KeyboardWrapper
                    contentContainerStyle={styles.scrollContent}
                    dismissOnTap={false}
                    scrollViewProps={{
                        bounces: false,
                        showsVerticalScrollIndicator: false,
                    }}
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
                </KeyboardWrapper>
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
    },
    bgTop: {
        position: "absolute",
        top: -120,
        right: -40,
        width: 260,
        height: 260,
        borderRadius: 130,
    },
    bgBottom: {
        position: "absolute",
        bottom: -80,
        left: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
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
        fontWeight: "600",
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 24,
        paddingVertical: 28,
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
    },
    subtitle: {
        marginTop: 8,
        fontSize: 15,
        lineHeight: 23,
    },
    body: {
        gap: 16,
    },
});
