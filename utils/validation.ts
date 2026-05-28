export const PASSWORD_HELPER_TEXT = "Password must include uppercase, lowercase, and a number.";
export const NEPAL_PHONE_HELPER_TEXT = "Currently available in Nepal only.";
export const MINIMUM_ORDER_HINT =
    "Minimum order value is Rs. 500. Please add enough items because small quantities may not receive vendor offers.";
export const PICKUP_DELIVERY_OFFER_HINT =
    "Pickup and delivery service should be included in the vendor's final offer price.";

export const sanitizePhoneInput = (value: string) => value.replace(/\D/g, "").slice(0, 10);

export const isValidNepalPhone = (value: string) => /^\d{10}$/.test(value);

export const validatePassword = (value: string, minLength = 6) => {
    if (value.length < minLength) {
        return `Password must be at least ${minLength} characters.`;
    }

    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) {
        return PASSWORD_HELPER_TEXT;
    }

    return null;
};

export const sanitizeDecimalInput = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    const [whole, ...rest] = cleaned.split(".");
    return rest.length > 0 ? `${whole}.${rest.join("")}` : whole;
};

export const sanitizeIntegerInput = (value: string) => value.replace(/\D/g, "");
