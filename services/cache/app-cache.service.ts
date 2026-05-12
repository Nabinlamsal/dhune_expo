import AsyncStorage from "@react-native-async-storage/async-storage";

const TEMP_STORAGE_KEYS = [
    "notifications.push.registered.token",
    "notifications.push.registered.user_id",
] as const;

const TEMP_STORAGE_PREFIXES = ["rating_submitted_", "rating_prompt_seen_"] as const;

export const clearTemporaryCache = async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    const removableKeys = allKeys.filter(
        (key) =>
            TEMP_STORAGE_KEYS.includes(key as (typeof TEMP_STORAGE_KEYS)[number]) ||
            TEMP_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
    );

    if (removableKeys.length > 0) {
        await AsyncStorage.multiRemove(removableKeys);
    }
};
