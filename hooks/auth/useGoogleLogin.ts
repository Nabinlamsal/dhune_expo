import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { setAuthSession } from "@/services/auth/session.service";
import { googleLogin } from "@/services/auth/auth.service";

export const useGoogleLogin = () => {
    const { initializeSession } = useNotifications();

    return useMutation({
        mutationFn: googleLogin,
        onSuccess: async (res) => {
            const session = {
                token: res.access_token,
                userId: res.user.id,
                role: res.user.role,
            } as const;

            await setAuthSession(session);
            await initializeSession(session);

            router.replace("/(tabs)/home");
        },
    });
};
