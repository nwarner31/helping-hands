import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {API_BASE_URL} from "../config";

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
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }
        return config;
    };

    private handleResponse = (response: AxiosResponse) => response;

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
