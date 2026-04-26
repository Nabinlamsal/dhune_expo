import { forgotPassword } from "@/services/auth/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: forgotPassword,
    });
};
