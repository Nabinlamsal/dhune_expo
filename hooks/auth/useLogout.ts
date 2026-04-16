import { useNotifications } from "@/hooks/notifications/useNotifications";
import { clearAuthSession } from "@/services/auth/session.service";
import { useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
    const queryClient = useQueryClient();
    const { clearForLogout } = useNotifications();

    return async () => {
        await clearForLogout();
        await clearAuthSession();
        queryClient.clear();
    };
};
