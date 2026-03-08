import { LoginRequest, LoginResponse } from "../../types/auth/login";
import { api } from "../../libs/api";
import { SignupResponse } from "../../types/auth/signup";
import { UserIdentity } from "../../types/auth/identity";

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
}
