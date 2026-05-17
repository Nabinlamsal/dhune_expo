import { ApiResponse } from "../api";

export interface Payment {
    id: string;
    order_id?: string;
    orderId?: string;
    payer_id?: string;
    payerId?: string;
    vendor_id?: string;
    vendorId?: string;
    amount: string;
    payment_method?: string;
    paymentMethod?: string;
    payment_status?: string;
    paymentStatus?: string;
    gateway_reference?: string | null;
    gatewayReference?: string | null;
    created_at?: string;
    createdAt?: string;
    updated_at?: string;
    updatedAt?: string;
}

export interface PayCashPayload {
    order_id: string;
}

export interface InitiateKhaltiPayload {
    order_id: string;
    amount?: number;
    purchase_order_id?: string;
    purchase_order_name?: string;
    return_url?: string;
}

export interface VerifyKhaltiPayload {
    pidx: string;
}

export interface InitiateKhaltiData {
    pidx: string;
    payment_url: string;
    expires_at?: string;
    expires_in?: number;
}

export type PayCashResponse = ApiResponse<Payment>;
export type InitiateKhaltiResponse = ApiResponse<InitiateKhaltiData>;
export type VerifyKhaltiResponse = ApiResponse<Payment>;
