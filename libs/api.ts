import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
    baseURL: "http://172.20.10.6:8111",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
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