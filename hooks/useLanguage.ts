import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import i18n, { AppLanguage, LANGUAGE_STORAGE_KEY } from "@/i18n";

export const languageOptions: { code: AppLanguage; label: string; nativeLabel: string }[] = [
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "np", label: "Nepali", nativeLabel: "नेपाली" },
];

export function useLanguage() {
    const { t } = useTranslation();

    const currentLanguage = useMemo<AppLanguage>(() => {
        return i18n.language === "np" ? "np" : "en";
    }, [i18n.language]);

    const setLanguage = useCallback(async (language: AppLanguage) => {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        await i18n.changeLanguage(language);
    }, []);

    return {
        currentLanguage,
        isNepali: currentLanguage === "np",
        languageOptions,
        setLanguage,
        t,
    };
}
