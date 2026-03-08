"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return () => {
        // Clear session
        localStorage.removeItem("token");

        // Clear cache
        queryClient.clear();

        // Go to login
        router.replace("/auth/login");
    };
};