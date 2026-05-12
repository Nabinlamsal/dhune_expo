export type FAQItem = {
    question: string;
    answer: string;
};

export type LegalSection = {
    title: string;
    body: string[];
};

export const SUPPORT_EMAIL = "support@dhune.app";
export const SUPPORT_PHONE = "+977-9800000000";

export const helpCenterFaqs: FAQItem[] = [
    {
        question: "How do I reset my password?",
        answer:
            "Open Settings, expand Forgot Password, request the OTP sent to your registered email, then submit the OTP with a new password.",
    },
    {
        question: "How do I report inappropriate content?",
        answer:
            "Use the relevant reporting action on the request, order, or profile screen. Include clear details so the support team can review the issue quickly.",
    },
    {
        question: "How can I delete my account?",
        answer:
            "Contact support from the Help Center and request account deletion using the email linked to your Dhune account so ownership can be verified securely.",
    },
    {
        question: "Why are notifications not working?",
        answer:
            "Check device notification permissions, confirm you are connected to the internet, and make sure battery saver restrictions are not blocking background delivery.",
    },
    {
        question: "How do I update my profile information?",
        answer:
            "Go to Profile, choose Update Profile Details, then edit your name, phone number, or profile photo and save your changes.",
    },
];

export const termsOfServiceSections: LegalSection[] = [
    {
        title: "1. Acceptance of Terms",
        body: [
            "These placeholder terms describe the general structure for Dhune's platform rules until final legal copy is approved.",
            "By creating an account or using the application, users agree to follow platform requirements, community standards, and applicable laws.",
        ],
    },
    {
        title: "2. Account Responsibilities",
        body: [
            "Users are responsible for keeping login credentials secure and for maintaining accurate account information.",
            "Dhune may restrict or suspend accounts involved in fraud, abuse, impersonation, or any activity that puts other users at risk.",
        ],
    },
    {
        title: "3. Marketplace Conduct",
        body: [
            "Users must communicate honestly, fulfill accepted commitments in good faith, and avoid posting misleading or prohibited content.",
            "Any misuse of payment, delivery, dispute, or review workflows may result in moderation or permanent removal from the platform.",
        ],
    },
    {
        title: "4. Service Availability",
        body: [
            "Dhune aims to keep the service available and reliable, but uptime, notifications, and third-party integrations may occasionally be interrupted.",
            "Features may be updated, paused, or removed as the product evolves.",
        ],
    },
    {
        title: "5. Limitation and Disputes",
        body: [
            "Dhune may investigate reports, preserve operational logs, and cooperate with lawful requests where necessary.",
            "Final production legal language should define liability, dispute handling, refunds, governing law, and other enforceable terms in detail.",
        ],
    },
];

export const privacyPolicySections: LegalSection[] = [
    {
        title: "1. Information We Collect",
        body: [
            "This placeholder privacy policy outlines how Dhune may collect profile information, contact details, device metadata, and platform activity required to operate the service.",
            "Additional categories may include support requests, notification preferences, and content users create or upload inside the app.",
        ],
    },
    {
        title: "2. How Information Is Used",
        body: [
            "Collected information may be used to authenticate accounts, deliver marketplace features, improve product performance, prevent abuse, and respond to support cases.",
            "Dhune may also use limited operational data to monitor reliability and troubleshoot service issues.",
        ],
    },
    {
        title: "3. Sharing and Disclosure",
        body: [
            "Information may be shared with service providers only where needed to support hosting, notifications, analytics, moderation, or compliance operations.",
            "Dhune should not sell personal information without explicit policy coverage and required user notice.",
        ],
    },
    {
        title: "4. Data Retention and Security",
        body: [
            "Data should be retained only for as long as needed for legitimate operational, contractual, or legal purposes.",
            "Reasonable technical and organizational safeguards should be maintained to protect stored information from unauthorized access.",
        ],
    },
    {
        title: "5. User Choices",
        body: [
            "Users should be able to request profile updates, manage notification preferences, and contact support about privacy questions.",
            "Final legal content should define jurisdiction-specific rights such as access, correction, deletion, and objection where applicable.",
        ],
    },
];
