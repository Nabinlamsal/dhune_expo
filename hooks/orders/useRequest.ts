import { cancelRequest, createRequest, getMyRequests, getMyRequestStats, getRequestById } from "@/services/orders/request_service";
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



export const useMyRequestStats = () =>
    useQuery({
        queryKey: ["requests", "my", "stats"],
        queryFn: async () => {
            const res = await getMyRequestStats();
            return res.data;
        },
    });
