import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.data) {
            // Check if backend returned a structured ErrorResponse
            const backendError = error.response.data;
            if (backendError.message) {
                // Return a new error with the backend message
                return Promise.reject(new Error(backendError.message));
            }
        }
        return Promise.reject(error);
    }
);
