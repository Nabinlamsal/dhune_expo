import axios from "axios";

const collectStrings = (value: unknown, bucket: string[]) => {
    if (typeof value === "string") {
        bucket.push(value);
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => collectStrings(item, bucket));
        return;
    }

    if (value && typeof value === "object") {
        Object.values(value).forEach((item) => collectStrings(item, bucket));
    }
};

export const extractErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const messages: string[] = [];
        collectStrings(error.response?.data, messages);

        if (messages.length > 0) {
            return messages.join(" ").trim();
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong.";
};

export const isEmailNotVerifiedError = (error: unknown): boolean => {
    return extractErrorMessage(error).toLowerCase().includes("email not verified");
};
