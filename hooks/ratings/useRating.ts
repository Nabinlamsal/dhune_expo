import { upsertOrderRating } from "@/services/ratings/rating_service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpsertOrderRating = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertOrderRating,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};
