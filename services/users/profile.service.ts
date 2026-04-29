import { api } from "@/libs/api";
import { ApiResponse } from "@/types/api";
import { MyProfile } from "@/types/users/my-profile";
import {
    DeleteProfileImagePayload,
    ProfileMutationResult,
    UpdateMyProfilePayload,
    UploadProfileImagePayload,
} from "@/types/users/profile-update";

type ProfileResponseShape =
    | ApiResponse<{ profile?: MyProfile; image_url?: string; profile_image?: string }>
    | { profile?: MyProfile; image_url?: string; profile_image?: string; message?: string };

const extractProfileMutationResult = (
    response: ProfileResponseShape
): ProfileMutationResult => {
    const data = "data" in response ? response.data : response;
    const record = data as Record<string, unknown> | undefined;

    return {
        message:
            ("message" in response && typeof response.message === "string"
                ? response.message
                : undefined),
        profile: (record?.profile as MyProfile | undefined) ?? undefined,
        imageUrl:
            (typeof record?.image_url === "string" && record.image_url) ||
            (typeof record?.profile_image === "string" && record.profile_image) ||
            null,
        raw: response,
    };
};

export const getMyProfile = async (): Promise<MyProfile> => {
    const response = await api<ApiResponse<{ profile: MyProfile }>>("/user/me/profile", {
        method: "GET",
    });

    return response.data.profile;
};

export const updateMyProfile = async (
    payload: UpdateMyProfilePayload
): Promise<ProfileMutationResult> => {
    const response = await api<ProfileResponseShape>("/user/me/profile", {
        method: "PUT",
        data: payload,
    });

    return extractProfileMutationResult(response);
};

export const uploadProfileImage = async (
    payload: UploadProfileImagePayload
): Promise<ProfileMutationResult> => {
    const formData = new FormData();

    formData.append("profile_image", {
        uri: payload.image.uri,
        name: payload.image.name,
        type: payload.image.mimeType ?? "image/jpeg",
    } as any);

    const response = await api<ProfileResponseShape>("/user/me/photo", {
        method: "PUT",
        data: formData,
        headers: {
            "Content-type": "multipart/form-data",
        },
    });

    return extractProfileMutationResult(response);
};

export const deleteProfileImage = async (
    _payload?: DeleteProfileImagePayload
): Promise<ProfileMutationResult> => {
    const response = await api<ProfileResponseShape>("/user/me/photo", {
        method: "DELETE",
    });

    return extractProfileMutationResult(response);
};
