import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    Clock,
    User,
    LogOut,
    Sparkles,
    CreditCard
} from "lucide-react";

import logo from "../../assets/logo.png";

const navItemBase =
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200";
const navItemInactive =
    "text-slate-400 hover:bg-slate-800 hover:text-white";
const navItemActive =
    "bg-slate-800 text-white shadow-sm border border-slate-700/50";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <aside className="hidden lg:flex h-screen sticky top-0 w-64 shrink-0 flex-col bg-slate-950 border-r border-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                {/* Logo Area */}
                <div className="p-5 border-b border-slate-900">
                    <NavLink to="/dashboard" className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <img src={logo} alt="Legalyze Logo" className="w-8 h-8 rounded-lg group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 bg-lime-300/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Legalyze</span>
                    </NavLink>
                </div>

                {/* Navegación principal */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">

                    <div className="px-3 mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</span>
                    </div>

                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
                        }
                    >
                        <LayoutDashboard className="w-[18px] h-[18px]" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/contracts/analyze"
                        className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mt-2 mb-2 ${isActive
                                ? "bg-lime-300 text-slate-950 shadow-lg shadow-lime-300/10 border border-lime-400"
                                : "text-lime-300 hover:bg-lime-300/10 border border-transparent hover:border-lime-300/20"
                            }`
                        }
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-[18px] h-[18px]" />
                            <span>Analizar contrato</span>
                        </div>
                    </NavLink>

                    <NavLink
                        to="/history"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
                        }
                    >
                        <Clock className="w-[18px] h-[18px]" />
                        <span>Mi historial</span>
                    </NavLink>

                    <div className="px-3 mt-8 mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preference</span>
                    </div>

                    <NavLink
                        to="/pricing"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
                        }
                    >
                        <CreditCard className="w-[18px] h-[18px]" />
                        <span>Suscripción</span>
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
                        }
                    >
                        <User className="w-[18px] h-[18px]" />
                        <span>Ajustes</span>
                    </NavLink>
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-slate-900 bg-slate-950/50">
                    <div className="flex items-center justify-between">
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-slate-900 p-2 rounded-xl transition-colors flex-1 overflow-hidden"
                            onClick={() => navigate("/profile")}
                        >
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-slate-300 text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0 px-2 justify-center">
                                <span className="text-sm font-bold text-white truncate">{user?.name}</span>
                                {user?.agencyName ? (
                                    <span className="text-xs text-lime-400 font-semibold truncate" title={user.agencyName}>
                                        {user.agencyName}
                                    </span>
                                ) : (
                                    <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleLogoutClick}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-900 rounded-xl transition-colors shrink-0"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">¿Cerrar sesión?</h3>
                        <p className="text-slate-400 mb-8 text-sm">¿Estás seguro de que quieres salir de tu cuenta?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-5 py-2.5 text-slate-300 hover:bg-slate-800 rounded-xl font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-5 py-2.5 rounded-xl font-semibold transition-all"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
