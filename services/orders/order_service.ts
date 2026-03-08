import { api } from "@/src/libs/api";
import { ApiResponse } from "@/src/types/api";
import { OrderListItem, CancelOrderPayload, UpdateOrderStatusPayload, OrderDetailResponse, OrderStats } from "@/src/types/orders/orders";



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

//get vendor orders
export const getVendorOrders = async (
    options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }
): Promise<ApiResponse<OrderListItem[]>> => {

    const {
        status,
        limit = 10,
        offset = 0
    } = options || {};

    let url = `/vendor/orders?limit=${limit}&offset=${offset}`;

    if (status) {
        url += `&status=${status}`;
    }

    return api<ApiResponse<OrderListItem[]>>(url, {
        method: "GET",
    });
};

// PATCH /vendor/orders/:id/status
export const updateOrderStatus = async (
    orderId: string,
    payload: UpdateOrderStatusPayload
): Promise<ApiResponse<{ message: string }>> => {
    return api<ApiResponse<{ message: string }>>(
        `/vendor/orders/${orderId}/status`,
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

// GET /admin/orders
export const getAdminOrders = async (
    status?: string,
    limit = 10,
    offset = 0
): Promise<ApiResponse<OrderListItem[]>> => {

    let url = `/admin/orders?limit=${limit}&offset=${offset}`;

    if (status) {
        url += `&status=${status}`;
    }

    return api<ApiResponse<OrderListItem[]>>(url, {
        method: "GET",
    });
};

// User stats
export const getMyOrderStats = async (): Promise<ApiResponse<OrderStats>> => {
    return api<ApiResponse<OrderStats>>(
        "/orders/me/stats",
        { method: "GET" }
    );
};

// Vendor stats
export const getVendorOrderStats = async (): Promise<ApiResponse<OrderStats>> => {
    return api<ApiResponse<OrderStats>>(
        "/vendor/orders/stats",
        { method: "GET" }
    );
};
export const getAdminOrderStats = async (): Promise<ApiResponse<OrderStats>> => {
    return api<ApiResponse<OrderStats>>(
        "/admin/orders/stats"
    )
}