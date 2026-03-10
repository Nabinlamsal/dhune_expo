import { api } from "@/libs/api";
import { ApiResponse } from "@/types/api";
import { CancelOrderPayload, OrderDetailResponse, OrderListItem, OrderStats } from "@/types/orders/orders";


// GET /orders/my
export const getMyOrders = async (
    limit = 10,
    offset = 0
): Promise<ApiResponse<OrderListItem[]>> => {
    return api<ApiResponse<OrderListItem[]>>(
        `/orders/my?limit=${limit}&offset=${offset}`,
        { method: "GET" }
    );
};

// PATCH /orders/:id/cancel
export const cancelOrder = async (
    orderId: string,
    payload?: CancelOrderPayload
): Promise<ApiResponse<{ message: string }>> => {
    return api<ApiResponse<{ message: string }>>(
        `/orders/${orderId}/cancel`,
        {
            method: "PATCH",
            data: payload,
        }
    );
};


// GET /orders/:id
export const getOrderById = async (
    orderId: string
): Promise<ApiResponse<OrderDetailResponse>> => {
    return api<ApiResponse<OrderDetailResponse>>(
        `/orders/${orderId}`,
        { method: "GET" }
    );
};

// User stats
export const getMyOrderStats = async (): Promise<ApiResponse<OrderStats>> => {
    return api<ApiResponse<OrderStats>>(
        "/orders/me/stats",
        { method: "GET" }
    );
};