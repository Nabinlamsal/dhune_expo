"use client";
import { signup } from "@/services/auth/auth.service";
import { useMutation } from "@tanstack/react-query";
import { SignupResponse } from "../../types/auth/signup";

export const useSignup = () => {
    return useMutation<SignupResponse, Error, FormData>({
        mutationFn: signup,
        onSuccess: (data) => {
            console.log("User Signed Up", data)
        }
    })
}
