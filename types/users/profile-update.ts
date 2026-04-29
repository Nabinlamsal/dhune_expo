import { MyProfile } from "./my-profile";

export type UpdateMyProfilePayload = {
    name: string;
    phone: string;
};

export type UploadableImageAsset = {
    uri: string;
    name: string;
    mimeType?: string | null;
};

export type UploadProfileImagePayload = {
    image: UploadableImageAsset;
};

export type DeleteProfileImagePayload = void;

export type ProfileMutationResult = {
    message?: string;
    profile?: MyProfile;
    imageUrl?: string | null;
    raw?: unknown;
};
