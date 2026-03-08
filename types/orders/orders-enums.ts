export type PaymentMethod = "CASH" | "ONLINE";

export type RequestStatus =
    | "OPEN"
    | "CANCELLED"
    | "ORDER_CREATED"
    | "EXPIRED";

export type OfferStatus =
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN"
    | "EXPIRED"

export type OrderStatus =
    | "ALL"
    | "ACCEPTED"
    | "PICKED_UP"
    | "IN_PROGRESS"
    | "DELIVERING"
    | "COMPLETED"
    | "CANCELLED";

export type PaymentStatus =
    | "PAID"
    | "UNPAID"
    | "REFUNDED"