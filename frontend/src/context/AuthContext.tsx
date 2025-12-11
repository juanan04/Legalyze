// src/context/AuthContext.tsx
import {
    createContext,
    useContext,
    useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type User = {
    id: number;
    name: string;
    email: string;
    profileImage?: string;
    credits: number;
    freeAnalysisUsed: boolean;
    emailVerified: boolean;
};

type AuthContextValue = {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("auth_user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const navigate = useNavigate();

    const login = (jwt: string, userData: User) => {
        setToken(jwt);
        setUser(userData);
        localStorage.setItem("auth_token", jwt);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        navigate("/dashboard", { replace: true });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        navigate("/login", { replace: true });
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated: !!token,
                login,
                logout,
                updateUser,
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
