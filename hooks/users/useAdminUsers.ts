
import { getUserDetail, getUsersFiltered } from "@/src/services/users/admin_users.service";
import { AdminUserProfile } from "@/src/types/users/admin-user-profile";
import { AdminUserFilter } from "@/src/types/users/filter";
import { useQuery } from "@tanstack/react-query";

export const useGetUsersFiltered = (filter: AdminUserFilter) => {
    return useQuery({
        queryKey: [
            "admin-users",
            filter.roles?.join(",") ?? "all",
            filter.status ?? "all",
            filter.limit,
            filter.offset,
            filter.search ?? "",
        ],
        queryFn: () => getUsersFiltered(filter),
        placeholderData: (prev) => prev,
    });
};

export const useGetUserProfile = (userId: string) => {
    return useQuery<AdminUserProfile>({
        queryKey: ["admin-user", userId],
        queryFn: () => getUserDetail(userId),
        enabled: !!userId,
        staleTime: 0,
    });
};