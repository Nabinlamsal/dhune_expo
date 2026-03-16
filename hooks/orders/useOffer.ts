import {
    acceptOffer,
    getOffersByRequest,
    rejectOffer,
} from "@/services/orders/offer_service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOffersByRequest = (requestId: string) =>
    useQuery({
        queryKey: ["offers", "request", requestId],
        queryFn: () => getOffersByRequest(requestId),
        enabled: !!requestId,
    });

export const useAcceptOffer = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: acceptOffer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["offers"] });
            qc.invalidateQueries({ queryKey: ["my-requests"] });
            qc.invalidateQueries({ queryKey: ["request-detail"] });
            qc.invalidateQueries({ queryKey: ["requests"] });
            qc.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};

export const useRejectOffer = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: rejectOffer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["offers"] });
            qc.invalidateQueries({ queryKey: ["my-requests"] });
            qc.invalidateQueries({ queryKey: ["request-detail"] });
        },
    });
};
