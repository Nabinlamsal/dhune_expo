import { api } from "@/src/libs/api";
import { AdminUserProfile } from "@/src/types/users/admin-user-profile";
import { AdminUsersPayload, AdminUserSummary } from "@/src/types/users/admin-user-summary";
import { ApiResponse } from "@/src/types/api";
import { AdminUserFilter } from "@/src/types/users/filter";

export const getUsersFiltered = async (
    filter: AdminUserFilter
): Promise<AdminUserSummary[]> => {

    const params = new URLSearchParams({
        limit: String(filter.limit),
        offset: String(filter.offset),
    });

    if (filter.roles?.length) {
        params.set("roles", filter.roles.join(","));
    }

    if (filter.status) {
        params.set("status", filter.status);
    }

    if (filter.search) {
        params.set("search", filter.search);
    }

    const res = await api<ApiResponse<AdminUsersPayload>>(
        `/admin/users?${params.toString()}`,
        { method: "GET" }
    );

    return res.data.users;
};

export const getUserDetail = async (
    userId: string
): Promise<AdminUserProfile> => {

    const res = await api<ApiResponse<{ userDetail: AdminUserProfile }>>(
        `/admin/users/${userId}/profile`,
        { method: "GET" }
    );

    return res.data.userDetail;
};