import { Role } from "../auth/identity";
import { ApprovalStatus } from "./user.enums";
//for admin table
export interface AdminUserSummary {
    ID: string;

    DisplayName: string;
    Email: string;
    Phone: string;

    Role: Role;

    IsActive: boolean;

    BusinessApprovalStatus?: ApprovalStatus | null;
    VendorApprovalStatus?: ApprovalStatus | null;

    CreatedAt: string;
}
export interface AdminUsersPayload {
    users: AdminUserSummary[];
}