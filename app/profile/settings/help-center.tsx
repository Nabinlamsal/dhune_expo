import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import ContactSupportCard from "./components/ContactSupportCard";
import FAQAccordion from "./components/FAQAccordion";
import SettingsOptionTile from "./components/SettingsOptionTile";
import { helpCenterFaqs, SUPPORT_EMAIL, SUPPORT_PHONE } from "./content";

export default function HelpCenterScreen() {
    const { theme } = useAppTheme();
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Help Center"
                    subtitle="Support contacts, answers, and legal information."
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
                    <Text style={[styles.heroEyebrow, { color: theme.primary }]}>Support</Text>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>
                        Get help quickly when something blocks your Dhune experience.
                    </Text>
                    <Text style={[styles.heroText, { color: theme.textMuted }]}>
                        Reach support directly, browse common answers, or review platform policies.
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
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Contact Support</Text>
                    <View style={styles.stack}>
                        <ContactSupportCard
                            icon="mail-outline"
                            title="Support Email"
                            value={SUPPORT_EMAIL}
                            caption="Tap to compose an email"
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
                            title="Call Center"
                            value={SUPPORT_PHONE}
                            caption="Tap to place a phone call"
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
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Frequently Asked Questions</Text>
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
                    <Text style={[styles.sectionTitle, { color: theme.primary }]}>Legal</Text>
                    <View style={styles.stack}>
                        <SettingsOptionTile
                            icon="document-text-outline"
                            title="Terms of Service"
                            subtitle="Review the structure of Dhune's terms and platform rules."
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
                            title="Privacy Policy"
                            subtitle="Read how data is collected, used, and protected."
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
