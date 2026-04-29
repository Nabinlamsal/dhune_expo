import { deleteProfileImage } from "@/services/users/profile.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteProfileImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteProfileImage,
        onSuccess: (result) => {
            if (result.profile) {
                queryClient.setQueryData(["user", "me", "profile"], result.profile);
            }

            queryClient.invalidateQueries({ queryKey: ["user", "me", "profile"] });
        },
    });
};
