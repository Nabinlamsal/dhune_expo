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
    vendor_name?: string;
    average_rating?: number;
    total_ratings?: number;
    vendor_rating?: number;
    vendor_completed_jobs?: number;
    vendor_distance_km?: number;
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

export interface RejectOfferPayload {
    offer_id: string;
}

export interface AcceptOfferResponse {
    order_id: string;
}

export interface RejectOfferResponse {
    message: string;
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
export type RejectResponse = ApiResponse<RejectOfferResponse>;
export type OfferStatsResponse = ApiResponse<OfferStats>;
