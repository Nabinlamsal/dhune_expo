import { ApiResponse } from "../api";

export type DisputeType = "damage" | "missing";

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "REJECTED";

export type DisputeUploadFile = {
    uri: string;
    name: string;
    mimeType?: string | null;
};

export interface CreateDisputePayload {
    order_id: string;
    dispute_type: DisputeType;
    description: string;
    image?: DisputeUploadFile | null;
    image_url?: string;
}

export interface DisputeMessage {
    message: string;
}

export type CreateDisputeResponse = ApiResponse<DisputeMessage>;
