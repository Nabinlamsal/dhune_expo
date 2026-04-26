import { resetPassword } from "@/services/auth/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useResetPassword = () => {
    return useMutation({
        mutationFn: resetPassword,
    });
};
