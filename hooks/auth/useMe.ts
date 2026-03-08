import { me } from "@/services/auth/auth.service";
import { useQuery } from "@tanstack/react-query";

export const useMe = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: me,
        retry: false,
    });
};