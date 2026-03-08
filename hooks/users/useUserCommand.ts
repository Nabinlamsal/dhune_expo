import { approveVendor, rejectVendor, approveBusiness, rejectBusiness, suspendUser, reactivateUser } from "@/src/services/users/admin_command.service";
import { CommandResponse, UserCommandPayload } from "@/src/types/users/command";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useAdminCommand = (
    mutationFn: (payload: UserCommandPayload) => Promise<CommandResponse>
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["admin-users"],
            });

            queryClient.invalidateQueries({
                queryKey: ["admin-user", variables.userId],
            });
        },
    });
};

export const useVendorApprove = () =>
    useAdminCommand(approveVendor);

export const useVendorReject = () =>
    useAdminCommand(rejectVendor);

export const useBusinessApprove = () =>
    useAdminCommand(approveBusiness);

export const useBusinessReject = () =>
    useAdminCommand(rejectBusiness);

export const useSuspendUser = () =>
    useAdminCommand(suspendUser);

export const useReactivateUser = () =>
    useAdminCommand(reactivateUser);