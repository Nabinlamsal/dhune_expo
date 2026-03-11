import { api } from "@/libs/api";
import { ApiResponse } from "@/types/api";
import { CancelRequestResponse, CreateRequestPayload, CreateRequestResponse, GetRequestResponse, ListMyRequestsResponse, RequestStats } from "@/types/orders/requests";

//create request
export const createRequest = async (
    payload: CreateRequestPayload
): Promise<CreateRequestResponse> => {
    return api<CreateRequestResponse>("/requests", {
        method: "POST",
        data: payload,
    });
}

//my requests
export const getMyRequests = async (
    limit = 10,
    offset = 0
): Promise<ListMyRequestsResponse> => {
    return api<ListMyRequestsResponse>(
        `/requests/me?limit=${limit}&offset=${offset}`,
        { method: "GET" }
    );
};

//get my id
export const getRequestById = async (
    id: string
): Promise<GetRequestResponse> => {
    return api<GetRequestResponse>(`/requests/${id}`, {
        method: "GET",
    });
};

//cancel request if open
export const cancelRequest = async (
    id: string
): Promise<CancelRequestResponse> => {
    return api<CancelRequestResponse>(`/requests/${id}/cancel`, {
        method: "PATCH",
    });
};

export const getMyRequestStats = async () => {
    return api<ApiResponse<RequestStats>>("/requests/me/stats", {
        method: "GET",
    });
};
