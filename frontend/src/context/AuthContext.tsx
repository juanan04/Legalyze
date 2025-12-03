// src/context/AuthContext.tsx
import {
    createContext,
    useContext,
    useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextValue = {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
    const navigate = useNavigate();

    const login = (jwt: string) => {
        setToken(jwt);
        localStorage.setItem("auth_token", jwt);
        navigate("/dashboard", { replace: true });
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("auth_token");
        navigate("/login", { replace: true });
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
};
