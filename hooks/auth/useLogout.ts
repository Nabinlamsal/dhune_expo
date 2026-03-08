import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
    const queryClient = useQueryClient();

    return async () => {
        await AsyncStorage.removeItem("token");
        queryClient.clear();
    };
};