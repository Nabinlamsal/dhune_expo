"use client";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/src/services/auth/auth.service";
import { useRouter } from "next/navigation";

export const useLogin = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: login,
        onSuccess: (res) => {
            localStorage.setItem("token", res.access_token);

            // console.log("LOGIN RESPONSE:", res);
            const role = res.user.role

            if (role === "admin") {
                router.replace("/admin");
                return;
            }
            if (role === "vendor") {
                router.replace("/vendor");
                return;
            }
            router.replace("/mobile-app");
        }
    });
};