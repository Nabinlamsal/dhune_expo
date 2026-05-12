import ScreenHeader from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/contexts/ThemeContext";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { termsOfServiceSections } from "./content";

export default function TermsOfServiceScreen() {
    const { theme } = useAppTheme();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <ScreenHeader
                    title="Terms of Service"
                    subtitle="Placeholder structure until final legal copy is approved."
                    backHref="/profile/settings/help-center"
                />

                <View
                    style={[
                        styles.documentCard,
                        {
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                        },
                    ]}
                >
                    <Text style={[styles.documentLead, { color: theme.textMuted }]}>
                        This draft content is a UI-ready placeholder for the final Dhune terms. Replace
                        each section with approved legal text before release.
                    </Text>

                    {termsOfServiceSections.map((section, index) => (
                        <View key={section.title} style={styles.section}>
                            {index > 0 ? (
                                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            ) : null}
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
                            {section.body.map((paragraph) => (
                                <Text
                                    key={paragraph}
                                    style={[styles.paragraph, { color: theme.textMuted }]}
                                >
                                    {paragraph}
                                </Text>
                            ))}
                        </View>
                    ))}
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
    },
    documentCard: {
        borderWidth: 1,
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    documentLead: {
        fontSize: 12,
        lineHeight: 19,
        fontWeight: "500",
        marginBottom: 12,
    },
    section: {
        marginTop: 4,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: "800",
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 13,
        lineHeight: 21,
        fontWeight: "500",
        marginBottom: 10,
    },
});
