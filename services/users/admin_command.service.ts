import { api } from "@/src/libs/api";
import { CommandResponse, UserCommandPayload } from "@/src/types/users/command";

const patchCommand = async (
    path: string
): Promise<CommandResponse> => {
    return api<CommandResponse>(path, {
        method: "PATCH",
    });
};

export const approveVendor = (payload: UserCommandPayload) =>
    patchCommand(`/admin/vendors/${payload.userId}/approve`);

export const rejectVendor = (payload: UserCommandPayload) =>
    patchCommand(`/admin/vendors/${payload.userId}/reject`);

export const approveBusiness = (payload: UserCommandPayload) =>
    patchCommand(`/admin/business/${payload.userId}/approve`);

export const rejectBusiness = (payload: UserCommandPayload) =>
    patchCommand(`/admin/business/${payload.userId}/reject`);

export const suspendUser = (payload: UserCommandPayload) =>
    patchCommand(`/admin/users/${payload.userId}/suspend`);

export const reactivateUser = (payload: UserCommandPayload) =>
    patchCommand(`/admin/users/${payload.userId}/reactivate`);