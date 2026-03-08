import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
    baseURL: "http://192.168.18.4:8111", // NOT localhost
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config: any) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export async function api<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> {
    const response = await apiClient.request<T>({
        url,
        ...config,
    });

    return response.data;
}