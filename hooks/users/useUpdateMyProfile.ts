import { updateMyProfile } from "@/services/users/profile.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateMyProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateMyProfile,
        onSuccess: (result) => {
            if (result.profile) {
                queryClient.setQueryData(["user", "me", "profile"], result.profile);
            }

            queryClient.invalidateQueries({ queryKey: ["user", "me", "profile"] });
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
};
