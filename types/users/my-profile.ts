import { Role } from "../auth/identity";
import { BusinessProfile, VendorProfile } from "./profile";
import { UserDocument } from "./document";

export interface MyProfile {
    ID: string;
    DisplayName: string;
    Email: string;
    Phone: string;
    Role: Role;
    IsActive: boolean;
    IsVerified: boolean;
    CreatedAt: string;
    BusinessProfile?: BusinessProfile | null;
    VendorProfile?: VendorProfile | null;
    Documents?: UserDocument[];
}
