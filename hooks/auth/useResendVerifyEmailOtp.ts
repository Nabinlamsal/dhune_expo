import { resendVerifyEmailOtp } from "@/services/auth/auth.service";
import { useMutation } from "@tanstack/react-query";

export const useResendVerifyEmailOtp = () => {
    return useMutation({
        mutationFn: resendVerifyEmailOtp,
    });
};
