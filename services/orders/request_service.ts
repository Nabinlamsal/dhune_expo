import { api } from "@/src/libs/api";
import { ApiResponse } from "@/src/types/api";
import { CancelRequestResponse, CreateRequestPayload, CreateRequestResponse, GetRequestResponse, ListAdminRequestsResponse, ListMarketplaceResponse, ListMyRequestsResponse, RequestStats } from "@/src/types/orders/requests";

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

//all requests for vendor
export const getMarketplaceRequests = async (
    options?: {
        categoryId?: string;
        limit?: number;
        offset?: number;
    }
): Promise<ListMarketplaceResponse> => {

    const {
        categoryId,
        limit = 10,
        offset = 0
    } = options || {};

    let url = `/marketplace/requests?limit=${limit}&offset=${offset}`;

    if (categoryId) {
        url += `&category_id=${categoryId}`;
    }

    return api<ListMarketplaceResponse>(url, {
        method: "GET",
    });
};

//requests for admin
export const getAdminRequests = async (
    status?: string,
    limit = 10,
    offset = 0
): Promise<ListAdminRequestsResponse> => {
    let url = `/admin/requests?limit=${limit}&offset=${offset}`;

    if (status) {
        url += `&status=${status}`;
    }

    return api<ListAdminRequestsResponse>(url, {
        method: "GET",
    });
};

export const getMyRequestStats = async () => {
    return api<ApiResponse<RequestStats>>("/requests/me/stats", {
        method: "GET",
    });
};

export const getAdminRequestStats = async () => {
    return api<ApiResponse<RequestStats>>("/admin/requests/stats", {
        method: "GET",
    });
};