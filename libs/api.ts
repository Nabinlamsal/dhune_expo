import axios, { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8111",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        console.log("Token", token)
        if (token) {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

export async function api<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> {
    try {
        const response = await apiClient.request<T>({
            url,
            ...config,
        });

        return response.data;
    } catch (error: any) {
        // normalize error
        throw error;
    }
}
