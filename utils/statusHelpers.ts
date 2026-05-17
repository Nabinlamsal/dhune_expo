export const formatStatusLabel = (status?: string | null) => {
    if (!status) return "-";
    return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getRequestStatusColor = (status?: string | null) => {
    switch (status) {
        case "OPEN":
            return "#ebbc01";
        case "ORDER_CREATED":
            return "#22c55e";
        case "CANCELLED":
            return "#ef4444";
        case "EXPIRED":
            return "#9ca3af";
        default:
            return "#64748b";
    }
};

export const getOrderStatusColor = (status?: string | null) => {
    switch (status) {
        case "ACCEPTED":
            return "#2563eb";
        case "PICKED_UP":
        case "IN_PROGRESS":
            return "#ebbc01";
        case "DELIVERING":
            return "#8b5cf6";
        case "COMPLETED":
            return "#22c55e";
        case "CANCELLED":
            return "#ef4444";
        default:
            return "#64748b";
    }
};

export const getPaymentStatusColor = (status?: string | null) => {
    switch (status) {
        case "PAID":
            return "#0d7a43";
        case "UNPAID":
            return "#b45309";
        default:
            return "#64748b";
    }
};
