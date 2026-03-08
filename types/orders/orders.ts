import { ApiResponse } from "../api";
import { OrderStatus, PaymentStatus } from "./orders-enums";
import { RequestDetail } from "./requests";

export interface OrderListItem {
    id: string;
    request_id: string;
    final_price: number;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    created_at: string;

    user_name?: string;
    user_phone?: string;

    vendor_name?: string;
    vendor_phone?: string;

    pickup_address: string;

    services: {
        category_id: string;
        category_name: string;
        selected_unit: string;
        quantity_value: number;
    }[];
}

export interface OrderDetailResponse {
    id: string;
    request_id: string;
    final_price: number;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    created_at: string;

    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };

    vendor: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };

    request: RequestDetail;

    services: {
        category_id: string;
        category_name: string;
        selected_unit: string;
        quantity_value: number;
    }[];
}

export interface OrderStats {
    recent_orders: any;
    total_orders: number;
    accepted_orders: number;
    picked_up_orders: number;
    in_progress_orders: number;
    delivering_orders: number;
    completed_orders: number;
    cancelled_orders: number;
}

export interface UpdateOrderStatusPayload {
    status: OrderStatus;
}

export interface CancelOrderPayload {
    reason?: string;
}

export type ListOrdersResponse = ApiResponse<OrderListItem[]>;
export type OrderResponse = ApiResponse<OrderDetailResponse>;
export type OrderStatsResponse = ApiResponse<OrderStats>;
export type OrderMessageResponse = ApiResponse<{ message: string }>;