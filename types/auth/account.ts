import { LoginResponse } from "./login";

export type VerifyEmailPayload = {
    token?: string;
    code?: string;
    email?: string;
};

export type ForgotPasswordPayload = {
    email: string;
};

export type ResetPasswordPayload = {
    token: string;
    new_password: string;
};

export type ChangePasswordPayload = {
    old_password: string;
    new_password: string;
};

export type GoogleLoginPayload = {
    id_token: string;
    access_token?: string;
};

export type AuthActionResponse = {
    success?: boolean;
    message?: string;
    data?: unknown;
};

export type GoogleLoginResponse = LoginResponse;
