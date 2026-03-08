import { ApiResponse } from "../api";
import { OfferStatus } from "./orders-enums";

export interface Offer {
    id: string;
    request_id: string;
    vendor_id?: string;
    bid_price: number;
    completion_time: string;
    status: OfferStatus;
    description?: string;
    created_at?: string;
}

export interface CreateOfferPayload {
    request_id: string;
    bid_price: number;
    completion_time: string;
    description?: string;
}

export interface UpdateOfferPayload {
    bid_price: number;
    completion_time: string;
    description?: string;
}

export interface AcceptOfferPayload {
    offer_id: string;
}

export interface AcceptOfferResponse {
    order_id: string;
}


export interface OfferStats {
    total_offers: number;
    pending_offers: number;
    accepted_offers: number;
    rejected_offers: number;
    withdrawn_offers: number;
    expired_offers: number;
}

export type ListOffersResponse = ApiResponse<Offer[]>;
export type OfferResponse = ApiResponse<Offer>;
export type AcceptResponse = ApiResponse<AcceptOfferResponse>;
export type OfferStatsResponse = ApiResponse<OfferStats>;