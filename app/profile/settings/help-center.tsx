import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ContactSupportCard from "./components/ContactSupportCard";
import FAQAccordion from "./components/FAQAccordion";
import SettingsOptionTile from "./components/SettingsOptionTile";
import { getHelpCenterFaqs, SUPPORT_EMAIL, SUPPORT_PHONE } from "./content";

export default function HelpCenterScreen() {
    const { theme } = useAppTheme();
    const { t } = useTranslation();
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
    const helpCenterFaqs = getHelpCenterFaqs(t);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title={t("helpCenter.title")}
                    subtitle={t("helpCenter.subtitle")}
                    backHref="/profile/settings"
                />

                <View
                    style={[
                        styles.heroCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text style={[styles.heroEyebrow, { color: theme.primary }]}>{t("settings.support")}</Text>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>
                        {t("helpCenter.heroTitle")}
                    </Text>
                    <Text style={[styles.heroText, { color: theme.textMuted }]}>
                        {t("helpCenter.heroText")}
                    </Text>
                </View>

                <View
                    style={[
                        styles.sectionCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                        {t("helpCenter.contactSupport")}
                    </Text>
                    <View style={styles.stack}>
                        <ContactSupportCard
                            icon="mail-outline"
                            title={t("helpCenter.supportEmail")}
                            value={SUPPORT_EMAIL}
                            caption={t("helpCenter.emailCaption")}
                            onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
                            colors={{
                                card: theme.surfaceMuted,
                                border: theme.border,
                                text: theme.text,
                                textMuted: theme.textMuted,
                                primary: theme.primary,
                                primarySoft: theme.primarySoft,
                            }}
                        />
                        <ContactSupportCard
                            icon="call-outline"
                            title={t("helpCenter.callCenter")}
                            value={SUPPORT_PHONE}
                            caption={t("helpCenter.callCaption")}
                            onPress={() => void Linking.openURL(`tel:${SUPPORT_PHONE}`)}
                            colors={{
                                card: theme.surfaceMuted,
                                border: theme.border,
                                text: theme.text,
                                textMuted: theme.textMuted,
                                primary: theme.primary,
                                primarySoft: theme.primarySoft,
                            }}
                        />
                    </View>
                </View>

                <View
                    style={[
                        styles.sectionCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>
                        {t("helpCenter.faqTitle")}
                    </Text>
                    <View style={styles.stack}>
                        {helpCenterFaqs.map((item, index) => (
                            <FAQAccordion
                                key={item.question}
                                question={item.question}
                                answer={item.answer}
                                expanded={expandedQuestion === index}
                                onPress={() =>
                                    setExpandedQuestion((current) => (current === index ? null : index))
                                }
                                colors={{
                                    card: theme.card,
                                    surfaceMuted: theme.surfaceMuted,
                                    border: theme.border,
                                    text: theme.text,
                                    textMuted: theme.textMuted,
                                    primary: theme.primary,
                                    primaryContrast: theme.primaryContrast,
                                }}
                            />
                        ))}
                    </View>
                </View>

                <View
                    style={[
                        styles.sectionCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t("helpCenter.legal")}</Text>
                    <View style={styles.stack}>
                        <SettingsOptionTile
                            icon="document-text-outline"
                            title={t("termsOfService.title")}
                            subtitle={t("helpCenter.termsSubtitle")}
                            onPress={() => router.push("/profile/settings/terms-of-service")}
                            colors={{
                                card: theme.surfaceMuted,
                                border: theme.border,
                                text: theme.text,
                                textMuted: theme.textMuted,
                                primary: theme.primary,
                                primarySoft: theme.primarySoft,
                                danger: theme.danger,
                                dangerSoft: theme.dangerSoft,
                            }}
                        />
                        <SettingsOptionTile
                            icon="shield-checkmark-outline"
                            title={t("privacyPolicy.title")}
                            subtitle={t("helpCenter.privacySubtitle")}
                            onPress={() => router.push("/profile/settings/privacy-policy")}
                            colors={{
                                card: theme.surfaceMuted,
                                border: theme.border,
                                text: theme.text,
                                textMuted: theme.textMuted,
                                primary: theme.primary,
                                primarySoft: theme.primarySoft,
                                danger: theme.danger,
                                dangerSoft: theme.dangerSoft,
                            }}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    container: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 24,
        gap: 10,
    },
    heroCard: {
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    heroEyebrow: {
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        fontWeight: "800",
    },
    heroTitle: {
        marginTop: 8,
        fontSize: 19,
        lineHeight: 26,
        fontWeight: "800",
    },
    heroText: {
        marginTop: 8,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: "500",
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        marginBottom: 12,
    },
    stack: {
        gap: 10,
    },
});
