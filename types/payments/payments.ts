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

export type OnlinePaymentMethod = "KHALTI" | "ESEWA";

export interface InitiateOrderPaymentPayload {
    method: OnlinePaymentMethod;
    return_url?: string;
}

export interface InitiateOrderPaymentData {
    payment_url?: string;
    paymentUrl?: string;
    redirect_url?: string;
    redirectUrl?: string;
    url?: string;
}

export type PayCashResponse = ApiResponse<Payment>;
export type InitiateOrderPaymentResponse = ApiResponse<InitiateOrderPaymentData>;
