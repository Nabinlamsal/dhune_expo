import {
    AdminUserFilterStatus,
} from "./user.enums";
import { Role } from "../auth/identity";

//admin-user filters
export interface AdminUserFilter {
    roles?: Role[];

    status?: AdminUserFilterStatus;

    search?: string;

    limit: number;

    offset: number;
}
