export type FAQItem = {
    question: string;
    answer: string;
};

export type LegalSection = {
    title: string;
    body: string[];
};

type T = (key: string) => string;

export const SUPPORT_EMAIL = "dhune.business@gmail.com";
export const SUPPORT_PHONE = "+977-9869793130";

export const getHelpCenterFaqs = (t: T): FAQItem[] =>
    ["resetPassword", "reportContent", "deleteAccount", "notifications", "updateProfile"].map(
        (key) => ({
            question: t(`helpCenter.faq.${key}.question`),
            answer: t(`helpCenter.faq.${key}.answer`),
        })
    );

export const getTermsOfServiceSections = (t: T): LegalSection[] =>
    ["acceptance", "account", "conduct", "availability", "disputes"].map((key) => ({
        title: t(`termsOfService.sections.${key}.title`),
        body: [t(`termsOfService.sections.${key}.body1`), t(`termsOfService.sections.${key}.body2`)],
    }));

export const getPrivacyPolicySections = (t: T): LegalSection[] =>
    ["collection", "usage", "sharing", "retention", "choices"].map((key) => ({
        title: t(`privacyPolicy.sections.${key}.title`),
        body: [t(`privacyPolicy.sections.${key}.body1`), t(`privacyPolicy.sections.${key}.body2`)],
    }));
