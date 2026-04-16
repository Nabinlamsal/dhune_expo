import { ApiResponse } from "./api";
import { Role } from "./auth/identity";

export type NotificationEntityType = "request" | "offer" | "order" | "user";

export type NotificationEventType =
    | "USER_REGISTERED"
    | "VENDOR_APPROVED"
    | "VENDOR_REJECTED"
    | "BUSINESS_APPROVED"
    | "BUSINESS_REJECTED"
    | "USER_SUSPENDED"
    | "USER_REACTIVATED"
    | "REQUEST_CREATED"
    | "REQUEST_CANCELLED"
    | "OFFER_CREATED"
    | "OFFER_UPDATED"
    | "OFFER_WITHDRAWN"
    | "OFFER_ACCEPTED"
    | "ORDER_CREATED"
    | "ORDER_STATUS_UPDATED"
    | "ORDER_CANCELLED"
    | "ORDER_MARKED_PAID"
    | "ORDER_REFUNDED";

export type NotificationItem = {
    id: string;
    type: NotificationEventType | string;
    title: string;
    body: string;
    entity_type: NotificationEntityType;
    entity_id: string;
    actor_user_id?: string | null;
    data?: Record<string, unknown>;
    is_read: boolean;
    read_at?: string | null;
    created_at: string;
    isLive?: boolean;
};

export type NotificationSocketPayload = Omit<
    NotificationItem,
    "id" | "is_read" | "read_at" | "created_at" | "isLive"
>;

export type NotificationSocketMessage = {
    type: NotificationEventType | string;
    data: NotificationSocketPayload;
};

export type NotificationListParams = {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
};

export type NotificationListResponse = ApiResponse<NotificationItem[]>;

export type UnreadCountResponse = ApiResponse<{
    unread_count?: number;
    count?: number;
}>;

export type RegisterNotificationDevicePayload = {
    platform: "android" | "ios";
    token: string;
    device_id?: string;
};

export type RemoveNotificationDevicePayload = {
    token: string;
};

export type StoredPushRegistration = RegisterNotificationDevicePayload;

export type StoredAuthSession = {
    token: string;
    userId: string;
    role: Role;
};
