import { ApiResponse } from "../api";
import { PricingUnit } from "../catalog/category-enums";
import { PaymentMethod, RequestStatus } from "./orders-enums";

export interface RequestServiceItem {
    category_id: string;
    selected_unit: PricingUnit;
    quantity_value: number;
    description?: string;
    items_json?: any;
}

//create requests layload
export interface CreateRequestPayload {
    pickup_address: string;
    pickup_time_from: string;
    pickup_time_to: string;   // ISO string
    payment_method: PaymentMethod;
    services: RequestServiceItem[];
}

//request summary
export interface RequestSummary {
    id: string;
    pickup_address: string;
    status: RequestStatus;
    created_at: string;
}

//detail of request
export interface RequestDetail {
    id: string;
    pickup_address: string;
    pickup_time_from: string;
    pickup_time_to: string;
    payment_method: PaymentMethod;
    status: RequestStatus;
    created_at: string;
    services: RequestServiceItem[];
}

//marketplace
export interface MarketplaceServiceItem {
    category_id: string;
    category_name: string;
    selected_unit: PricingUnit;
    quantity_value: number;
}

export interface MarketplaceRequest {
    id: string;
    pickup_address: string;
    pickup_time_from: string;
    pickup_time_to: string;
    expires_at: string;
    created_at: string;
    service_count: number;
    total_quantity: number;
    services: MarketplaceServiceItem[];
}
export interface RequestStats {
    total_requests: number;
    open_requests: number;
    expired_requests: number;
    cancelled_requests: number;
    order_created_requests: number;
}

//responces short hand types
export type RequestStatsResponse = ApiResponse<RequestStats>;

export type CreateRequestResponse = ApiResponse<RequestDetail>;

export type GetRequestResponse = ApiResponse<RequestDetail>;

export type ListMyRequestsResponse = ApiResponse<RequestSummary[]>;

export type ListMarketplaceResponse = ApiResponse<MarketplaceRequest[]>;

export type ListAdminRequestsResponse = ApiResponse<RequestSummary[]>;

export type CancelRequestResponse = ApiResponse<{
    message: string;
}>;