import { getMyProfile } from "@/services/users/profile.service";
import { useQuery } from "@tanstack/react-query";

export const useMyProfile = () =>
    useQuery({
        queryKey: ["user", "me", "profile"],
        queryFn: getMyProfile,
        retry: false,
    });
