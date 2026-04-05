import { ApiResponse } from "../api";

export interface UpsertRatingPayload {
    order_id: string;
    rating: number;
    review?: string;
}

export interface RatingMessage {
    message: string;
}

export type UpsertRatingResponse = ApiResponse<RatingMessage>;
