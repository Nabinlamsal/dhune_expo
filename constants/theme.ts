export type AppThemeMode = "light" | "dark";

export type AppTheme = {
    background: string;
    card: string;
    surfaceMuted: string;
    border: string;
    borderStrong: string;
    text: string;
    textMuted: string;
    textSoft: string;
    primary: string;
    primarySoft: string;
    primaryContrast: string;
    success: string;
    successContrast: string;
    danger: string;
    dangerSoft: string;
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;
    overlay: string;
};

export const appThemes: Record<AppThemeMode, AppTheme> = {
    light: {
        background: "#edf4ff",
        card: "#ffffff",
        surfaceMuted: "#f8fbff",
        border: "#dbe7ff",
        borderStrong: "#bfd2f6",
        text: "#0f172a",
        textMuted: "#64748b",
        textSoft: "#94a3b8",
        primary: "#0b2457",
        primarySoft: "#eff6ff",
        primaryContrast: "#ffffff",
        success: "#0d7a43",
        successContrast: "#ffffff",
        danger: "#b42318",
        dangerSoft: "#fff1f0",
        inputBackground: "#ffffff",
        inputBorder: "#dbe7ff",
        inputText: "#0f172a",
        inputPlaceholder: "#94a3b8",
        overlay: "rgba(15, 23, 42, 0.44)",
    },
    dark: {
        background: "#07111f",
        card: "#0d1b2d",
        surfaceMuted: "#12243a",
        border: "#1c3553",
        borderStrong: "#2a4b74",
        text: "#e7edf7",
        textMuted: "#9fb2cb",
        textSoft: "#7a90af",
        primary: "#8fb8ff",
        primarySoft: "#17304f",
        primaryContrast: "#07111f",
        success: "#1a8f5a",
        successContrast: "#f4fff8",
        danger: "#d14b41",
        dangerSoft: "#3a1717",
        inputBackground: "#102236",
        inputBorder: "#244261",
        inputText: "#edf4ff",
        inputPlaceholder: "#7f96b7",
        overlay: "rgba(2, 6, 23, 0.72)",
    },
};
