import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { login } from "../../services/auth/auth.service";

export const useLogin = () => {
    return useMutation({
        mutationFn: login,

        onSuccess: async (res) => {
            console.log("LOGIN SUCCESS:", res);

            await AsyncStorage.setItem("token", res.access_token);

            router.replace("/(tabs)/home");
        },

        onError: (err) => {
            console.log("LOGIN ERROR:", err);
        },
    });
};