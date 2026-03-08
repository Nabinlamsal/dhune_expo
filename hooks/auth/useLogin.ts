import { login } from "@/services/auth/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
    return useMutation({
        mutationFn: login,

        onSuccess: async (res) => {
            await AsyncStorage.setItem("token", res.access_token);
        },
    });
};