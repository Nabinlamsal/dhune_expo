import { api } from "@/libs/api";
import {
    InitiateOrderPaymentPayload,
    InitiateOrderPaymentResponse,
    PayCashResponse,
} from "@/types/payments/payments";

export const payCash = async (
    orderId: string
): Promise<PayCashResponse> => {
    return api<PayCashResponse>("/payments/cash", {
        method: "POST",
        data: {
            order_id: orderId,
        },
    });
};

export const initiateOrderPayment = async (
    orderId: string,
    payload: InitiateOrderPaymentPayload
): Promise<InitiateOrderPaymentResponse> => {
    return api<InitiateOrderPaymentResponse>(`/payments/orders/${orderId}/initiate`, {
        method: "POST",
        data: payload,
    });
};

export const getEsewaOrderPayUrl = (orderId: string) => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!baseUrl) {
        throw new Error("Payment server URL is not configured");
    }

    return `${baseUrl.replace(/\/$/, "")}/payments/orders/esewa/pay/${orderId}`;
};
