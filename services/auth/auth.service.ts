import { api } from "../../libs/api";
import {
    AuthActionResponse,
    ChangePasswordPayload,
    ForgotPasswordPayload,
    GoogleLoginPayload,
    GoogleLoginResponse,
    ResendVerifyEmailOtpPayload,
    ResetPasswordPayload,
    VerifyEmailPayload,
} from "../../types/auth/account";
import { UserIdentity } from "../../types/auth/identity";
import { LoginRequest, LoginResponse } from "../../types/auth/login";
import { SignupResponse } from "../../types/auth/signup";

export const login = async (
    payload: LoginRequest
): Promise<LoginResponse> => {
    const res = await api<{
        success: boolean;
        data: LoginResponse;
    }>("/auth/login", {
        method: "POST",
        data: payload,
    });

    return res.data;
};

export const signup = async (
    payload: FormData
): Promise<SignupResponse> => {
    return api<SignupResponse>("/auth/signup", {
        method: "POST",
        data: payload,
        headers: {
            "Content-type": "multipart/form-data",
        },
    });
}

export const me = (): Promise<UserIdentity> => {
    return api<UserIdentity>("/auth/me", {
        method: "GET",
    })
};

export const verifyEmail = async (
    payload: VerifyEmailPayload
): Promise<AuthActionResponse> => {
    return api<AuthActionResponse>("/auth/verify-email", {
        method: "POST",
        data: payload,
    });
};

export const resendVerifyEmailOtp = async (
    payload: ResendVerifyEmailOtpPayload
): Promise<AuthActionResponse> => {
    return api<AuthActionResponse>("/auth/verify-email/send-otp", {
        method: "POST",
        data: payload,
    });
};

export const forgotPassword = async (
    payload: ForgotPasswordPayload
): Promise<AuthActionResponse> => {
    return api<AuthActionResponse>("/auth/forgot-password", {
        method: "POST",
        data: payload,
    });
};

export const resetPassword = async (
    payload: ResetPasswordPayload
): Promise<AuthActionResponse> => {
    return api<AuthActionResponse>("/auth/reset-password", {
        method: "POST",
        data: payload,
    });
};

export const changePassword = async (
    payload: ChangePasswordPayload
): Promise<AuthActionResponse> => {
    return api<AuthActionResponse>("/auth/change-password", {
        method: "PUT",
        data: payload,
    });
};

export const googleLogin = async (
    payload: GoogleLoginPayload
): Promise<GoogleLoginResponse> => {
    const res = await api<{
        success?: boolean;
        data?: GoogleLoginResponse;
        access_token?: string;
        refresh_token?: string;
        user?: GoogleLoginResponse["user"];
    }>("/auth/google-login", {
        method: "POST",
        data: payload,
    });

    if (res.data) {
        return res.data;
    }

    return {
        access_token: res.access_token ?? "",
        refresh_token: res.refresh_token,
        user: res.user!,
    };
};
