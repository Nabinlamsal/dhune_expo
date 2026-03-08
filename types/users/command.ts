//base admin commands payload
export interface UserCommandPayload {
    userId: string; // uuid
}

//for future enhancements
export interface SuspendUserPayload extends UserCommandPayload {
    reason?: string;
}

export interface RejectUserPayload extends UserCommandPayload {
    reason?: string;
}

export interface ApproveUserPayload extends UserCommandPayload {
    note?: string;
}

export type CommandResponse = {
    success: boolean;
}