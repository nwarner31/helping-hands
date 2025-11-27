import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {API_BASE_URL} from "../config";
import {getAccessToken, setNewAccessToken} from "../context/AuthContext";

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true, // If using cookies for authentication
        });

        // Attach interceptors
        this.api.interceptors.request.use(this.handleRequest, this.handleError);
        this.api.interceptors.response.use(this.handleResponse, this.handleError);
    }

    private handleRequest = (config: InternalAxiosRequestConfig) => {
        const accessToken = getAccessToken();
        if (accessToken) {
            config.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return config;
    };

    private handleResponse = (response: AxiosResponse) => {
        const newAccessToken = response.headers['x-session-token'];
        if (newAccessToken) {
            setNewAccessToken(newAccessToken);
        }
        return response;
    };
    private handleError = (error: any) => {
        console.error("API Error:", error);
        return Promise.reject(error.response?.data || "An error occurred");
    };

    get<T>(url: string, config?: InternalAxiosRequestConfig<T>): Promise<T> {
        return this.api.get<T>(url, config).then((res) => res.data);
    }

    post<T>(url: string, data?: any, config?: InternalAxiosRequestConfig<T>): Promise<T> {
        return this.api.post<T>(url, data, config).then((res) => res.data);
    }

    patch<T>(url: string, data?: any, config?: InternalAxiosRequestConfig<T>): Promise<T> {
        return this.api.patch<T>(url, data, config).then((res) => res.data);
    }


    put<T>(url: string, data?: any, config?: InternalAxiosRequestConfig<T>): Promise<T> {
        return this.api.put<T>(url, data, config).then((res) => res.data);
    }

    delete<T>(url: string, config?: InternalAxiosRequestConfig<T>): Promise<T> {
        return this.api.delete<T>(url, config).then((res) => res.data);
    }
}

// Example usage:
const api = new ApiService();
export default api;
