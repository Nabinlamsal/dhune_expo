import { Role, UserIdentity } from "./identity";
export type LoginRequest = {
    email_or_phone: string;
    password: string;
};
export type LoginResponse = {
    access_token: string;
    refresh_token?: string;
    user: UserIdentity
};