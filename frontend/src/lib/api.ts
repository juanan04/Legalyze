import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    // withCredentials: true, // Removed to avoid CORS issues with cookies
});

// Interceptor to add Bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            if (backendError.message) {
                return Promise.reject(new Error(backendError.message));
            }
        }
        return Promise.reject(error);
    }
);