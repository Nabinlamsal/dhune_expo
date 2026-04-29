import AsyncStorage from "@react-native-async-storage/async-storage";
import { Role } from "@/types/auth/identity";
import {
    RegisterNotificationDevicePayload,
    StoredAuthSession,
    StoredPushRegistration,
} from "@/types/notifications";

const STORAGE_KEYS = {
    token: "token",
    userId: "auth.user.id",
    role: "auth.user.role",
    pushToken: "notifications.push.token",
    pushPlatform: "notifications.push.platform",
    pushDeviceId: "notifications.push.device_id",
    pushRegisteredToken: "notifications.push.registered.token",
    pushRegisteredUserId: "notifications.push.registered.user_id",
} as const;

export const setAuthSession = async (session: StoredAuthSession) => {
    await AsyncStorage.multiSet([
        [STORAGE_KEYS.token, session.token],
        [STORAGE_KEYS.userId, session.userId],
        [STORAGE_KEYS.role, session.role],
    ]);
};

export const getAuthSession = async (): Promise<StoredAuthSession | null> => {
    const entries = await AsyncStorage.multiGet([
        STORAGE_KEYS.token,
        STORAGE_KEYS.userId,
        STORAGE_KEYS.role,
    ]);

    const map = Object.fromEntries(entries);
    const token = map[STORAGE_KEYS.token];
    const userId = map[STORAGE_KEYS.userId];
    const role = map[STORAGE_KEYS.role] as Role | undefined;

    if (!token || !userId || !role) {
        return null;
    }

    return { token, userId, role };
};

export const clearAuthSession = async () => {
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.token,
        STORAGE_KEYS.userId,
        STORAGE_KEYS.role,
    ]);
};

export const setStoredPushRegistration = async (
    registration: RegisterNotificationDevicePayload
) => {
    await AsyncStorage.multiSet([
        [STORAGE_KEYS.pushToken, registration.token],
        [STORAGE_KEYS.pushPlatform, registration.platform],
        [STORAGE_KEYS.pushDeviceId, registration.device_id ?? ""],
    ]);
};

export const getStoredPushRegistration =
    async (): Promise<StoredPushRegistration | null> => {
        const entries = await AsyncStorage.multiGet([
            STORAGE_KEYS.pushToken,
            STORAGE_KEYS.pushPlatform,
            STORAGE_KEYS.pushDeviceId,
        ]);

        const map = Object.fromEntries(entries);
        const token = map[STORAGE_KEYS.pushToken];
        const platform = map[STORAGE_KEYS.pushPlatform] as
            | RegisterNotificationDevicePayload["platform"]
            | undefined;

        if (!token || !platform) {
            return null;
        }

        return {
            token,
            platform,
            device_id: map[STORAGE_KEYS.pushDeviceId] || undefined,
        };
    };

export const setStoredPushRegistrationSync = async (
    userId: string,
    token: string
) => {
    await AsyncStorage.multiSet([
        [STORAGE_KEYS.pushRegisteredUserId, userId],
        [STORAGE_KEYS.pushRegisteredToken, token],
    ]);
};

export const getStoredPushRegistrationSync = async (): Promise<{
    userId: string;
    token: string;
} | null> => {
    const entries = await AsyncStorage.multiGet([
        STORAGE_KEYS.pushRegisteredUserId,
        STORAGE_KEYS.pushRegisteredToken,
    ]);
    const map = Object.fromEntries(entries);
    const userId = map[STORAGE_KEYS.pushRegisteredUserId];
    const token = map[STORAGE_KEYS.pushRegisteredToken];

    if (!userId || !token) {
        return null;
    }

    return { userId, token };
};

export const clearStoredPushRegistrationSync = async () => {
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.pushRegisteredUserId,
        STORAGE_KEYS.pushRegisteredToken,
    ]);
};
