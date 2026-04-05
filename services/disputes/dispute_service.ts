import { api } from "@/libs/api";
import { CreateDisputePayload, CreateDisputeResponse } from "@/types/disputes/disputes";

export const createDispute = async (
    payload: CreateDisputePayload
): Promise<CreateDisputeResponse> => {
    const formData = new FormData();

    formData.append("order_id", payload.order_id);
    formData.append("dispute_type", payload.dispute_type);
    formData.append("description", payload.description);

    if (payload.image_url) {
        formData.append("image_url", payload.image_url);
    }

    if (payload.image?.uri) {
        formData.append("image", {
            uri: payload.image.uri,
            name: payload.image.name,
            type: payload.image.mimeType ?? "image/jpeg",
        } as any);
    }

    return api<CreateDisputeResponse>("/disputes", {
        method: "POST",
        data: formData,
        headers: {
            "Content-type": "multipart/form-data",
        },
    });
};
