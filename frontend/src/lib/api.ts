import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    withCredentials: true, // Esto puedes dejarlo o quitarlo si usas Bearer token
});

// --- AÑADE ESTO DE NUEVO ---
api.interceptors.request.use(
    (config) => {
        // 1. Recuperamos el token del almacenamiento local
        // Asegúrate de que al hacer login estás haciendo: localStorage.setItem('token', token)
        const token = localStorage.getItem("token");

        // 2. Si existe, se lo pegamos en la frente a la petición
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// ---------------------------

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