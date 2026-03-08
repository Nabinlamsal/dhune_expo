import { Role } from "../auth/identity";
import { ApprovalStatus } from "./user.enums";
import { BusinessProfile, VendorProfile } from "./profile";
import { UserDocument } from "./document";

//base user model
export interface AdminUserProfile {
    ID: string;
    DisplayName: string;
    Email: string;
    Phone: string;
    Role: Role;
    IsActive: boolean;
    IsVerified: boolean;
    CreatedAt: string;
    BusinessApprovalStatus?: ApprovalStatus | null;
    VendorApprovalStatus?: ApprovalStatus | null;

    BusinessProfile?: BusinessProfile | null;
    VendorProfile?: VendorProfile | null;
    Documents?: UserDocument[];
}
