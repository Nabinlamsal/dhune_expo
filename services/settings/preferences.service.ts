import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
    pushNotificationsEnabled: "settings.preferences.push_notifications",
    locationServicesEnabled: "settings.preferences.location_services",
} as const;

export type UserPreferences = {
    pushNotificationsEnabled: boolean;
    locationServicesEnabled: boolean;
};

const parseBoolean = (value: string | null) => value === "1";

export const getUserPreferences = async (): Promise<UserPreferences> => {
    const entries = await AsyncStorage.multiGet([
        STORAGE_KEYS.pushNotificationsEnabled,
        STORAGE_KEYS.locationServicesEnabled,
    ]);
    const map = Object.fromEntries(entries);

    return {
        pushNotificationsEnabled: parseBoolean(map[STORAGE_KEYS.pushNotificationsEnabled] ?? null),
        locationServicesEnabled: parseBoolean(map[STORAGE_KEYS.locationServicesEnabled] ?? null),
    };
};

export const setPushNotificationsPreference = async (enabled: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.pushNotificationsEnabled, enabled ? "1" : "0");
};

export const setLocationServicesPreference = async (enabled: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEYS.locationServicesEnabled, enabled ? "1" : "0");
};
