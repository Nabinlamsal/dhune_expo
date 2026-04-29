import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { RegisterNotificationDevicePayload } from "@/types/notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export const getNativePushRegistration =
    async (): Promise<RegisterNotificationDevicePayload | null> => {
        if (Platform.OS !== "android" && Platform.OS !== "ios") {
            return null;
        }

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
            });
        }

        const existingPermissions = await Notifications.getPermissionsAsync();
        let finalStatus = existingPermissions.status;

        if (finalStatus !== "granted") {
            const requestedPermissions = await Notifications.requestPermissionsAsync();
            finalStatus = requestedPermissions.status;
        }

        if (finalStatus !== "granted") {
            return null;
        }

        try {
            const devicePushToken = await Notifications.getDevicePushTokenAsync();
            const token = typeof devicePushToken.data === "string"
                ? devicePushToken.data
                : String(devicePushToken.data ?? "");

            if (!token) {
                return null;
            }

            return {
                platform: Platform.OS,
                token,
            };
        } catch (error) {
            console.log("Native push token error", error);
            return null;
        }
    };
