import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en";
import np from "./np";

export type AppLanguage = "en" | "np";

export const LANGUAGE_STORAGE_KEY = "dhune.language";

const resources = {
    en: { translation: en },
    np: { translation: np },
} as const;

const getDeviceLanguage = (): AppLanguage => {
    const locale = Localization.getLocales()[0];
    const languageCode = locale?.languageCode?.toLowerCase();
    const languageTag = locale?.languageTag?.toLowerCase();

    if (languageCode === "ne" || languageCode === "np" || languageTag?.startsWith("ne")) {
        return "np";
    }

    return "en";
};

const getSavedLanguage = async (): Promise<AppLanguage | null> => {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage === "en" || savedLanguage === "np" ? savedLanguage : null;
};

export const getInitialLanguage = async (): Promise<AppLanguage> => {
    const savedLanguage = await getSavedLanguage();
    return savedLanguage ?? getDeviceLanguage();
};

export const initI18n = async () => {
    const language = await getInitialLanguage();

    if (!i18n.isInitialized) {
        await i18n.use(initReactI18next).init({
            compatibilityJSON: "v4",
            fallbackLng: "en",
            interpolation: {
                escapeValue: false,
            },
            lng: language,
            react: {
                useSuspense: false,
            },
            resources,
            supportedLngs: ["en", "np"],
        });
        return;
    }

    await i18n.changeLanguage(language);
};

export default i18n;
