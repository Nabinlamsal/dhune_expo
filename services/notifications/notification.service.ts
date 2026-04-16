import { api } from "@/libs/api";
import { ApiResponse } from "@/types/api";
import {
    NotificationListParams,
    NotificationListResponse,
    RegisterNotificationDevicePayload,
    RemoveNotificationDevicePayload,
    UnreadCountResponse,
} from "@/types/notifications";

const DEFAULT_LIMIT = 20;

const buildQuery = ({
    limit = DEFAULT_LIMIT,
    offset = 0,
    unreadOnly = false,
}: NotificationListParams) => {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    params.set("unread_only", String(unreadOnly));
    return params.toString();
};

export const getNotifications = async (
    params: NotificationListParams = {}
): Promise<NotificationListResponse> => {
    return api<NotificationListResponse>(`/notifications?${buildQuery(params)}`, {
        method: "GET",
    });
};

export const getNotificationUnreadCount = async (): Promise<UnreadCountResponse> => {
    return api<UnreadCountResponse>("/notifications/unread-count", {
        method: "GET",
    });
};

export const markNotificationAsRead = async (
    id: string
): Promise<ApiResponse<unknown>> => {
    return api<ApiResponse<unknown>>(`/notifications/${id}/read`, {
        method: "PATCH",
    });
};

export const markAllNotificationsAsRead =
    async (): Promise<ApiResponse<unknown>> => {
        return api<ApiResponse<unknown>>("/notifications/read-all", {
            method: "PATCH",
        });
    };

export const registerNotificationDevice = async (
    payload: RegisterNotificationDevicePayload
): Promise<ApiResponse<unknown>> => {
    return api<ApiResponse<unknown>>("/notifications/devices", {
        method: "POST",
        data: payload,
    });
};

export const unregisterNotificationDevice = async (
    payload: RemoveNotificationDevicePayload
): Promise<ApiResponse<unknown>> => {
    return api<ApiResponse<unknown>>("/notifications/devices", {
        method: "DELETE",
        data: payload,
    });
};
