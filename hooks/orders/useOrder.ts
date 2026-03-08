"use client";
import { getMyOrders, cancelOrder, getVendorOrders, updateOrderStatus, getOrderById, getMyOrderStats, getVendorOrderStats, getAdminOrderStats, getAdminOrders } from "@/src/services/orders/order_service";
import { CancelOrderPayload, UpdateOrderStatusPayload } from "@/src/types/orders/orders";
import { OrderStatus } from "@/src/types/orders/orders-enums";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const useMyOrders = (limit = 10, offset = 0) => {
    return useQuery({
        queryKey: ["orders", "my", limit, offset],
        queryFn: async () => {
            const res = await getMyOrders(limit, offset);
            return res.data;
        },
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            payload,
        }: {
            orderId: string;
            payload?: CancelOrderPayload;
        }) => cancelOrder(orderId, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};

export const useVendorOrders = ({
    status,
    limit = 10,
    offset = 0,
}: {
    status?: OrderStatus;
    limit?: number;
    offset?: number;
}) => {
    return useQuery({
        queryKey: ["vendor-orders", status, limit, offset],
        queryFn: async () => {
            const res = await getVendorOrders({
                status,
                limit,
                offset,
            });

            return res.data;
        },
    });
};

export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            payload,
        }: {
            orderId: string;
            payload: UpdateOrderStatusPayload;
        }) => updateOrderStatus(orderId, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};

export const useAdminOrders = (
    status?: string,
    limit = 10,
    offset = 0
) => {
    return useQuery({
        queryKey: ["admin-orders", status, limit, offset],
        queryFn: async () => {
            const res = await getAdminOrders(status, limit, offset);
            return res.data;
        },
    });
};

export const useOrderDetail = (orderId?: string) => {
    return useQuery({
        queryKey: ["orders", "detail", orderId],
        queryFn: async () => {
            const res = await getOrderById(orderId as string);
            return res.data;
        },
        enabled: !!orderId,
    });
};

export const useMyOrderStats = () =>
    useQuery({
        queryKey: ["orders", "my", "stats"],
        queryFn: getMyOrderStats,
    });

export const useVendorOrderStats = () =>
    useQuery({
        queryKey: ["orders", "vendor", "stats"],
        queryFn: getVendorOrderStats,
    });

export const useAdminOrderStats = () =>
    useQuery({
        queryKey: ["orders", "admin", "stats"],
        queryFn: getAdminOrderStats,
    });