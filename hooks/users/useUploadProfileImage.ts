import { uploadProfileImage } from "@/services/users/profile.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUploadProfileImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadProfileImage,
        onSuccess: (result) => {
            if (result.profile) {
                queryClient.setQueryData(["user", "me", "profile"], result.profile);
            }

            queryClient.invalidateQueries({ queryKey: ["user", "me", "profile"] });
        },
    });
};
