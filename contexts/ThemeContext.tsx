import AsyncStorage from "@react-native-async-storage/async-storage";
import { appThemes, AppTheme, AppThemeMode, AppThemePreference } from "@/constants/theme";
import * as SystemUI from "expo-system-ui";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useColorScheme } from "react-native";

const STORAGE_KEY = "app.theme.preference";

type ThemeContextValue = {
    theme: AppTheme;
    mode: AppThemeMode;
    preference: AppThemePreference;
    setMode: (mode: AppThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
    const colorScheme = useColorScheme();
    const systemMode: AppThemeMode = colorScheme === "dark" ? "dark" : "light";
    const [preference, setPreference] = useState<AppThemePreference>("system");
    const mode: AppThemeMode = preference === "system" ? systemMode : preference;

    useEffect(() => {
        const loadMode = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored === "light" || stored === "dark" || stored === "system") {
                    setPreference(stored);
                }
            } catch {
                setPreference("system");
            }
        };

        void loadMode();
    }, []);

    useEffect(() => {
        void SystemUI.setBackgroundColorAsync(appThemes[mode].background);
    }, [mode]);

    const setMode = async (nextMode: AppThemePreference) => {
        setPreference(nextMode);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, nextMode);
        } catch {
            // Keep the current session interactive even if persistence fails.
        }
    };

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme: appThemes[mode],
            mode,
            preference,
            setMode,
        }),
        [mode, preference]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useAppTheme must be used within ThemeProvider");
    }
    return context;
};
