import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    withCredentials: true,
});

// Request interceptor removed as we now use HttpOnly cookies

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
