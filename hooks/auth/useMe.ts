import { me } from "@/src/services/auth/auth.service";
import { UserIdentity } from "@/src/types/auth/identity";
import { useQuery } from "@tanstack/react-query";

export const useMe = () => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    return useQuery<UserIdentity>({
        queryKey: ["me"],
        queryFn: me,
        retry: false,
    });
};