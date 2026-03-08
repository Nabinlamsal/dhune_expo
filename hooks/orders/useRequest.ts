"use client";

import { cancelRequest, createRequest, getAdminRequests, getAdminRequestStats, getMarketplaceRequests, getMyRequests, getMyRequestStats, getRequestById } from "@/src/services/orders/request_service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

//create req
export const useCreateRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-requests"] });
            queryClient.invalidateQueries({ queryKey: ["marketplace-requests"] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
    });
};

//my requests
export const useMyRequests = (limit = 10, offset = 0) => {
    return useQuery({
        queryKey: ["my-requests", limit, offset],
        queryFn: () => getMyRequests(limit, offset),
    });
};

//get request detail
export const useRequestDetail = (id: string) => {
    return useQuery({
        queryKey: ["request-detail", id],
        queryFn: () => getRequestById(id),
        enabled: !!id,
    });
};

//cancel requests
export const useCancelRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-requests"] });
            queryClient.invalidateQueries({ queryKey: ["marketplace-requests"] });
            queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
        },
    });
};

//vendor requests
export const useMarketplaceRequests = ({
    categoryId,
    limit = 10,
    offset = 0,
}: {
    categoryId?: string;
    limit?: number;
    offset?: number;
}) => {
    return useQuery({
        queryKey: ["marketplace-requests", categoryId, limit, offset],
        queryFn: async () => {
            const res = await getMarketplaceRequests({
                categoryId,
                limit,
                offset,
            });

            return res.data;
        },
    });
};
//admin requests
export const useAdminRequests = (
    status?: string,
    limit = 10,
    offset = 0
) => {
    return useQuery({
        queryKey: ["admin-requests", status, limit, offset],
        queryFn: () => getAdminRequests(status, limit, offset),
    });
};

export const useMyRequestStats = () =>
    useQuery({
        queryKey: ["requests", "my", "stats"],
        queryFn: getMyRequestStats,
    });

export const useAdminRequestStats = () =>
    useQuery({
        queryKey: ["requests", "admin", "stats"],
        queryFn: getAdminRequestStats,
    });