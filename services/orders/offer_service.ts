import { api } from "@/src/libs/api";
import {
    CreateOfferPayload,
    UpdateOfferPayload,
    ListOffersResponse,
    OfferResponse,
    AcceptResponse,
    OfferStatsResponse
} from "@/src/types/orders/offers";
import { OfferStatus } from "@/src/types/orders/orders-enums";

//vendor
export const createOffer = async (
    payload: CreateOfferPayload
): Promise<OfferResponse> => {
    return api<OfferResponse>("/offers/", {
        method: "POST",
        data: payload,
    });
};

export const updateOffer = async (
    id: string,
    payload: UpdateOfferPayload
): Promise<OfferResponse> => {
    return api<OfferResponse>(`/offers/${id}`, {
        method: "PUT",
        data: payload,
    });
};

export const withdrawOffer = async (
    id: string
) => {
    return api(`/offers/${id}`, {
        method: "DELETE",
    });
};

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

//admin
export const getAdminOffers = async (
    status?: OfferStatus,
    vendorId?: string,
    requestId?: string,
    limit = 10,
    offset = 0
): Promise<ListOffersResponse> => {
    let url = `/admin/offers?limit=${limit}&offset=${offset}`;

    if (status) url += `&status=${status}`;
    if (vendorId) url += `&vendor_id=${vendorId}`;
    if (requestId) url += `&request_id=${requestId}`;

    return api<ListOffersResponse>(url, {
        method: "GET",
    });
};

export const getAdminOfferStats = async (): Promise<OfferStatsResponse> => {
    return api<OfferStatsResponse>(
        "/admin/offers/stats",
        { method: "GET" }
    );
};

export const getVendorOfferStats = async (): Promise<OfferStatsResponse> => {
    return api<OfferStatsResponse>(
        "/offers/me/stats",
        { method: "GET" }
    );
};