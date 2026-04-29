import AsyncStorage from "@react-native-async-storage/async-storage";
import { appThemes, AppTheme, AppThemeMode } from "@/constants/theme";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const STORAGE_KEY = "app.theme.mode";

type ThemeContextValue = {
    theme: AppTheme;
    mode: AppThemeMode;
    setMode: (mode: AppThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
    const [mode, setModeState] = useState<AppThemeMode>("light");

    useEffect(() => {
        const loadMode = async () => {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored === "light" || stored === "dark") {
                setModeState(stored);
            }
        };

        void loadMode();
    }, []);

    const setMode = async (nextMode: AppThemeMode) => {
        setModeState(nextMode);
        await AsyncStorage.setItem(STORAGE_KEY, nextMode);
    };

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme: appThemes[mode],
            mode,
            setMode,
        }),
        [mode]
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
