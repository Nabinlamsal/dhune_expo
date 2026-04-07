import { cancelOrder, getMyOrderStats, getMyOrders, getOrderById } from "@/services/orders/order_service";
import { CancelOrderPayload } from "@/types/orders/orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
