import { ApprovalStatus } from "./user.enums";


export interface BusinessProfile {
    OwnerName: string;
    BusinessType: string;
    RegistrationNumber: string;
    ApprovalStatus: ApprovalStatus;
}

export interface VendorProfile {
    OwnerName: string;
    Address: string;
    BusinessLatitude?: number | null;
    BusinessLongitude?: number | null;
    ServiceRadiusKm?: number | null;
    RegistrationNumber: string;
    ApprovalStatus: ApprovalStatus;
}
