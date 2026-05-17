export const compactId = (prefix: string, value?: string | null) => {
    if (!value) return "-";
    const sum = Array.from(value).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return `${prefix}${(sum % 999) + 1}`;
};

export const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return value;

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

export const formatMoney = (amount?: number | string | null) => {
    const numericAmount = typeof amount === "string" ? Number(amount) : amount;

    if (typeof numericAmount !== "number" || Number.isNaN(numericAmount)) {
        return "Rs -";
    }

    return `Rs ${numericAmount.toLocaleString("en-US", {
        maximumFractionDigits: 2,
    })}`;
};

export const formatCoordinates = (lat?: number | string | null, lng?: number | string | null) => {
    if (lat == null || lng == null) return "-";
    return `${lat}, ${lng}`;
};
