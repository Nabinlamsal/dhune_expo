import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";

import {
    initiateKhalti,
    payCash
} from "@/services/payments/payments_service";
import { InitiateKhaltiData, InitiateKhaltiPayload, InitiateKhaltiResponse } from "@/types/payments/payments";

const getPaymentErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

const unwrapKhaltiResponse = (response: InitiateKhaltiResponse | InitiateKhaltiData) => {
    const data = response && "data" in response ? response.data : response;

    if (!data?.payment_url) {
        throw new Error("Payment URL not received");
    }

    return data;
};

const KHALTI_REDIRECT_URL = "dhunemobile://payment-result";

const openKhaltiPaymentUrl = async (paymentUrl: string) => {
    try {
        const result = await WebBrowser.openAuthSessionAsync(
            paymentUrl,
            KHALTI_REDIRECT_URL
        );

        console.log("KHALTI AUTH SESSION RESULT:", result);

        if (result.type === "success" && result.url) {
            if (result.url.includes("payment=success")) {
                Toast.show({
                    type: "success",
                    text1: "Payment Successful",
                    text2: "Your Khalti payment was completed",
                });
            } else if (
                result.url.includes("payment=failed") ||
                result.url.includes("payment=error")
            ) {
                Toast.show({
                    type: "error",
                    text1: "Payment Failed",
                    text2: "Khalti payment was not completed",
                });
            }
        }
    } catch (error) {
        console.log("KHALTI AUTH SESSION FAILED:", error);
        await WebBrowser.openBrowserAsync(paymentUrl);
    }
};

export const useCashPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            return await payCash({
                order_id: orderId,
            });
        },

        onSuccess: (_, orderId) => {
            Toast.show({
                type: "success",
                text1: "Payment Successful",
                text2: "Cash payment recorded successfully",
            });

            queryClient.invalidateQueries({
                queryKey: ["orders", "detail", orderId],
            });
            queryClient.invalidateQueries({
                queryKey: ["orders"],
            });
        },

        onError: (error: any) => {
            Toast.show({
                type: "error",
                text1: "Payment Failed",
                text2: getPaymentErrorMessage(error, "Unable to process cash payment"),
            });
        },
    });
};

export const useKhaltiPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: InitiateKhaltiPayload) => {
            console.log("KHALTI PAYLOAD:", payload);

            const response = await initiateKhalti(payload);

            console.log("KHALTI RESPONSE:", response);

            return unwrapKhaltiResponse(response);
        },

        onSuccess: async (data, payload) => {
            console.log("KHALTI PAYMENT URL:", data.payment_url);

            try {
                await openKhaltiPaymentUrl(data.payment_url);
            } catch (error: any) {
                Toast.show({
                    type: "error",
                    text1: "Unable to Open Khalti",
                    text2: getPaymentErrorMessage(error, "Please try again in a moment"),
                });
            } finally {
                queryClient.invalidateQueries({
                    queryKey: ["orders", "detail", payload.order_id],
                });
                queryClient.invalidateQueries({
                    queryKey: ["orders"],
                });
            }
        },

        onError: (error: any) => {
            console.log("KHALTI ERROR STATUS:", error?.response?.status);
            console.log("KHALTI ERROR DATA:", error?.response?.data);
            Toast.show({
                type: "error",
                text1: "Payment Failed",
                text2: getPaymentErrorMessage(error, "Unable to initiate Khalti payment"),
            });
        },
    });
};
