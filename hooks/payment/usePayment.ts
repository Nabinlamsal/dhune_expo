import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";

import {
    getEsewaOrderPayUrl,
    initiateOrderPayment,
    payCash
} from "@/services/payments/payments_service";
import { InitiateOrderPaymentData, InitiateOrderPaymentResponse } from "@/types/payments/payments";

WebBrowser.maybeCompleteAuthSession();

const getPaymentErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

const unwrapOrderPaymentResponse = (response: InitiateOrderPaymentResponse | InitiateOrderPaymentData) => {
    const data = response && "data" in response ? response.data : response;
    const paymentUrl = data?.payment_url ?? data?.paymentUrl ?? data?.redirect_url ?? data?.redirectUrl ?? data?.url;

    if (!paymentUrl) {
        throw new Error("Payment URL not received");
    }

    return paymentUrl;
};

const getPaymentReturnUrl = (orderId: string) => `dhune://orders/${encodeURIComponent(orderId)}`;

const getPaymentResult = (url?: string | null) => {
    if (!url) return null;

    const params = Linking.parse(url).queryParams ?? {};
    const payment = params.payment;
    const result = Array.isArray(payment) ? payment[0] : payment;
    return result == null ? null : String(result);
};

const showPaymentResultToast = (paymentResult: string | null) => {
    if (paymentResult === "success") {
        Toast.show({
            type: "success",
            text1: "Payment verification completed",
            text2: "Refreshing order status.",
        });
        return;
    }

    if (paymentResult === "failed") {
        Toast.show({
            type: "error",
            text1: "Payment failed",
            text2: "Please try again.",
        });
        return;
    }

    if (paymentResult === "error") {
        Toast.show({
            type: "error",
            text1: "Payment error",
            text2: "Please try again in a moment.",
        });
    }
};

const refetchOrderPaymentQueries = async (queryClient: QueryClient, orderId: string) => {
    await Promise.all([
        queryClient.invalidateQueries({
            queryKey: ["orders", "detail", orderId],
        }),
        queryClient.invalidateQueries({
            queryKey: ["orders"],
        }),
        queryClient.invalidateQueries({
            queryKey: ["orders", "my", "stats"],
        }),
    ]);
};

const openPaymentUrl = async (paymentUrl: string, orderId: string) => {
    const returnUrl = getPaymentReturnUrl(orderId);
    const result = await WebBrowser.openAuthSessionAsync(paymentUrl, returnUrl);
    const returnedUrl = result.type === "success" ? result.url : null;

    console.log("PAYMENT BROWSER RESULT:", result);
    if (result.type === "cancel" || result.type === "dismiss") {
        Toast.show({
            type: "info",
            text1: "Payment window closed",
            text2: "Pull to refresh if payment was completed.",
        });
        return;
    }
    showPaymentResultToast(getPaymentResult(returnedUrl));
};

export const useCashPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            return await payCash(orderId);
        },

        onSuccess: (_, orderId) => {
            Toast.show({
                type: "success",
                text1: "Payment Successful",
                text2: "Cash payment recorded successfully",
            });

            void refetchOrderPaymentQueries(queryClient, orderId);
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
        mutationFn: async (orderId: string) => {
            const response = await initiateOrderPayment(orderId, {
                method: "KHALTI",
                return_url: getPaymentReturnUrl(orderId),
            });

            return {
                orderId,
                paymentUrl: unwrapOrderPaymentResponse(response),
            };
        },

        onSuccess: async ({ orderId, paymentUrl }) => {
            try {
                await openPaymentUrl(paymentUrl, orderId);
            } catch (error: any) {
                Toast.show({
                    type: "error",
                    text1: "Unable to Open Khalti",
                    text2: getPaymentErrorMessage(error, "Please try again in a moment"),
                });
            } finally {
                await refetchOrderPaymentQueries(queryClient, orderId);
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

export const useEsewaPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderId: string) => {
            const returnUrl = getPaymentReturnUrl(orderId);
            const paymentUrl = await getEsewaOrderPayUrl(orderId, returnUrl);

            Toast.show({
                type: "info",
                text1: "Opening eSewa...",
            });

            await openPaymentUrl(paymentUrl, orderId);

            return { orderId };
        },

        onSuccess: async ({ orderId }) => {
            await refetchOrderPaymentQueries(queryClient, orderId);
        },

        onError: (error: any, orderId) => {
            Toast.show({
                type: "error",
                text1: "Could not open eSewa payment",
                text2: getPaymentErrorMessage(error, "Please try again in a moment"),
            });

            if (orderId) {
                void refetchOrderPaymentQueries(queryClient, orderId);
            }
        },
    });
};
