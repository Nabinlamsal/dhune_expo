import { api } from "@/libs/api";
import { ApiResponse } from "@/types/api";
import { MyProfile } from "@/types/users/my-profile";

export const getMyProfile = async (): Promise<MyProfile> => {
    const response = await api<ApiResponse<{ profile: MyProfile }>>("/user/me/profile", {
        method: "GET",
    });

    return response.data.profile;
};
