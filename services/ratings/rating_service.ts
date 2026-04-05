import { api } from "@/libs/api";
import { UpsertRatingPayload, UpsertRatingResponse } from "@/types/ratings/ratings";

export const upsertOrderRating = async (
    payload: UpsertRatingPayload
): Promise<UpsertRatingResponse> => {
    return api<UpsertRatingResponse>("/ratings", {
        method: "POST",
        data: payload,
    });
};
