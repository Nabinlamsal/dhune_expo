import { verifyEmail } from "@/services/auth/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: verifyEmail,
    });
};
