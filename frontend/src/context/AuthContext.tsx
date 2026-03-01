// src/context/AuthContext.tsx
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export type User = {
    id: number;
    name: string;
    email: string;
    agencyName?: string;
    jobPosition?: string;
    profileImage?: string;
    credits: number;
    freeTrialsRemaining: number;
    freeAnalysisUsed: boolean;
    emailVerified: boolean;
    betaNoticeAck?: boolean;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
};

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, user: User, rememberMe: boolean) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Token is now managed via HttpOnly cookie
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("auth_user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [rememberMe, setRememberMe] = useState<boolean>(() => {
        return localStorage.getItem("auth_remember_me") === "true";
    });

    // Inactivity Logic
    const [showInactivityModal, setShowInactivityModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

    const navigate = useNavigate();

    const login = useCallback((_jwt: string, userData: User, remember: boolean) => {
        setUser(userData);
        setRememberMe(remember);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        localStorage.setItem("auth_remember_me", String(remember));
        navigate("/dashboard", { replace: true });
    }, [navigate]);

    const logout = useCallback(async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        }

        setUser(null);
        setRememberMe(false);
        setShowInactivityModal(false);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_remember_me");
        navigate("/login", { replace: true });
    }, [navigate]);

    const updateUser = useCallback((userData: User) => {
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
    }, []);

    // Inactivity Timer
    const lastActivity = useRef(0);

    useEffect(() => {
        lastActivity.current = Date.now();
    }, []);

    const resetActivity = useCallback(() => {
        lastActivity.current = Date.now();
        if (showInactivityModal) {
            setShowInactivityModal(false);
        }
    }, [showInactivityModal]);

    useEffect(() => {
        if (!user || rememberMe) return; // Check user instead of token

        const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
        const handleActivity = () => {
            lastActivity.current = Date.now();
        };

        events.forEach(event => window.addEventListener(event, handleActivity));

        const intervalId = setInterval(() => {
            const now = Date.now();
            const inactiveTime = now - lastActivity.current;
            const warningTime = 13 * 60 * 1000; // 13 minutes
            const logoutTime = 15 * 60 * 1000; // 15 minutes

            if (inactiveTime >= logoutTime) {
                logout();
            } else if (inactiveTime >= warningTime) {
                if (!showInactivityModal) setShowInactivityModal(true);
                setTimeLeft(Math.ceil((logoutTime - inactiveTime) / 1000));
            } else {
                if (showInactivityModal) setShowInactivityModal(false);
            }
        }, 1000);

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            clearInterval(intervalId);
        };
    }, [user, rememberMe, logout, showInactivityModal]);

    const refreshProfile = useCallback(async () => {
        try {
            const { data } = await api.get<User>("/api/users/me");
            // Only update if data actually changed to avoid unnecessary re-renders
            if (JSON.stringify(data) !== JSON.stringify(user)) {
                setUser(data);
                localStorage.setItem("auth_user", JSON.stringify(data));
            }
        } catch (error: any) {
            console.error("Failed to refresh user profile", error);
            if (error.response?.status === 401) {
                logout();
            }
        }
    }, [user, logout]);

    // Refresh user data on mount and focus to keep verifying status in sync
    useEffect(() => {
        if (!user) return;

        refreshProfile();

        const handleFocus = () => {
            refreshProfile();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [refreshProfile, user]); // verify deps

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                login,
                logout,
                updateUser,
                refreshProfile,
            }}
        >
            {children}
            {showInactivityModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Cierre de sesión inminente</h3>
                        <p className="text-slate-400 mb-6">
                            Tu sesión se cerrará en <span className="text-red-400 font-bold">{timeLeft} segundos</span> por inactividad.
                        </p>
                        <button
                            onClick={resetActivity}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full"
                        >
                            Extender sesión
                        </button>
                    </div>
                </div>
            )}
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
