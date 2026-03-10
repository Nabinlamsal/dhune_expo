import { api } from "@/libs/api";
import {
    AcceptResponse,
    ListOffersResponse,
    OfferStatsResponse
} from "@/types/orders/offers";
import { OfferStatus } from "@/types/orders/orders-enums";


export const getMyOffers = async (
    options?: {
        status?: OfferStatus;
        sort?: "newest" | "expiring";
        limit?: number;
        offset?: number;
    }
): Promise<ListOffersResponse> => {

    const {
        status,
        sort = "newest",
        limit = 10,
        offset = 0
    } = options || {};

    let url = `/offers/my?limit=${limit}&offset=${offset}&sort=${sort}`;

    if (status) {
        url += `&status=${status}`;
    }

    return api<ListOffersResponse>(url, {
        method: "GET",
    });
};


//user
export const getOffersByRequest = async (
    requestId: string
): Promise<ListOffersResponse> => {
    return api<ListOffersResponse>(
        `/offers/request/${requestId}`,
        { method: "GET" }
    );
};

export const acceptOffer = async (
    payload: { offer_id: string }
): Promise<AcceptResponse> => {
    return api<AcceptResponse>("/offers/accept", {
        method: "POST",
        data: payload,
    });
};


export const getVendorOfferStats = async (): Promise<OfferStatsResponse> => {
    return api<OfferStatsResponse>(
        "/offers/me/stats",
        { method: "GET" }
    );
};