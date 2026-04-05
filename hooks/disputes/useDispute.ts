import { createDispute } from "@/services/disputes/dispute_service";
import { CreateDisputePayload } from "@/types/disputes/disputes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateDispute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDisputePayload) => createDispute(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["disputes"] });
        },
    });
};
