import {
    acceptOffer,
    getOffersByRequest
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
            qc.invalidateQueries({ queryKey: ["requests"] });
            qc.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};