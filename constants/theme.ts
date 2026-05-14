export type AppThemeMode = "light" | "dark";
export type AppThemePreference = AppThemeMode | "system";

export type AppTheme = {
    mode: AppThemeMode;
    background: string;
    surface: string;
    card: string;
    cardBackground: string;
    surfaceMuted: string;
    border: string;
    borderColor: string;
    borderStrong: string;
    text: string;
    primaryText: string;
    textMuted: string;
    secondaryText: string;
    textSoft: string;
    primary: string;
    primaryColor: string;
    primarySoft: string;
    primaryContrast: string;
    accent: string;
    accentSoft: string;
    success: string;
    successColor: string;
    successContrast: string;
    danger: string;
    errorColor: string;
    dangerSoft: string;
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;
    overlay: string;
    shadow: string;
    tabBarBackground: string;
    tabBarActive: string;
    tabBarInactive: string;
    disabled: string;
};

export const appThemes: Record<AppThemeMode, AppTheme> = {
    light: {
        mode: "light",
        background: "#edf4ff",
        surface: "#ffffff",
        card: "#ffffff",
        cardBackground: "#ffffff",
        surfaceMuted: "#f8fbff",
        border: "#dbe7ff",
        borderColor: "#dbe7ff",
        borderStrong: "#bfd2f6",
        text: "#0f172a",
        primaryText: "#0f172a",
        textMuted: "#64748b",
        secondaryText: "#64748b",
        textSoft: "#94a3b8",
        primary: "#0b2457",
        primaryColor: "#0b2457",
        primarySoft: "#eff6ff",
        primaryContrast: "#ffffff",
        accent: "#ebbc01",
        accentSoft: "#ebbc0115",
        success: "#0d7a43",
        successColor: "#0d7a43",
        successContrast: "#ffffff",
        danger: "#b42318",
        errorColor: "#b42318",
        dangerSoft: "#fff1f0",
        inputBackground: "#ffffff",
        inputBorder: "#dbe7ff",
        inputText: "#0f172a",
        inputPlaceholder: "#94a3b8",
        overlay: "rgba(15, 23, 42, 0.44)",
        shadow: "#0b2457",
        tabBarBackground: "#ffffff",
        tabBarActive: "#040947",
        tabBarInactive: "#111827",
        disabled: "#cbd5e1",
    },
    dark: {
        mode: "dark",
        background: "#121212",
        surface: "#181818",
        card: "#1e1e1e",
        cardBackground: "#1e1e1e",
        surfaceMuted: "#242424",
        border: "#343434",
        borderColor: "#343434",
        borderStrong: "#4a4a4a",
        text: "#f3f4f6",
        primaryText: "#f3f4f6",
        textMuted: "#c3cad5",
        secondaryText: "#c3cad5",
        textSoft: "#8f99a8",
        primary: "#9fcbff",
        primaryColor: "#9fcbff",
        primarySoft: "#19324d",
        primaryContrast: "#07111f",
        accent: "#f6c945",
        accentSoft: "rgba(246, 201, 69, 0.14)",
        success: "#34d399",
        successColor: "#34d399",
        successContrast: "#f4fff8",
        danger: "#f87171",
        errorColor: "#f87171",
        dangerSoft: "rgba(248, 113, 113, 0.14)",
        inputBackground: "#181818",
        inputBorder: "#3a3a3a",
        inputText: "#f3f4f6",
        inputPlaceholder: "#8f99a8",
        overlay: "rgba(0, 0, 0, 0.72)",
        shadow: "#000000",
        tabBarBackground: "#181818",
        tabBarActive: "#f6c945",
        tabBarInactive: "#c3cad5",
        disabled: "#5a6472",
    },
};
