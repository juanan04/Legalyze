import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    Search,
    FileText,
    Clock,
    User,
    LogOut
} from "lucide-react";

import logo from "../../assets/logo.png";

const navItemBase =
    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const navItemInactive =
    "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100";
const navItemActive = "bg-[#1f2937] text-white";

const Sidebar = () => {

    const { logout } = useAuth();
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
            <aside className="hidden lg:flex h-screen sticky top-0 w-64 shrink-0 flex-col bg-[#020617] border-r border-slate-800">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <NavLink to="/dashboard" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <img src={logo} alt="Legalyze Logo" className="w-10 h-10 rounded-lg" />
                        <span className="text-xl font-semibold text-white">Legalyze</span>
                    </NavLink>
                </div>

                {/* Navegación principal */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive
                            }`
                        }
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/contracts/analyze"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive
                            }`
                        }
                    >
                        <Search className="w-5 h-5" />
                        <span>Analizar contrato</span>
                    </NavLink>

                    <NavLink
                        to="/contracts/generate"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive
                            }`
                        }
                    >
                        <FileText className="w-5 h-5" />
                        <span>Generar contrato</span>
                    </NavLink>

                    <NavLink
                        to="/history"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive
                            }`
                        }
                    >
                        <Clock className="w-5 h-5" />
                        <span>Mi historial</span>
                    </NavLink>

                    <NavLink
                        to="/pricing"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive
                            }`
                        }
                    >
                        <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">€</span>
                        <span>Comprar Créditos</span>
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `${navItemBase} ${isActive ? navItemActive : navItemInactive
                            }`
                        }
                    >
                        <User className="w-5 h-5" />
                        <span>Mi perfil</span>
                    </NavLink>
                </nav>

                {/* Cerrar sesión */}
                <div className="p-4 mt-auto border-t border-slate-800">
                    <button
                        type="button"
                        onClick={handleLogoutClick}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg w-full text-left transition-colors cursor-pointer"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-white mb-2">¿Cerrar sesión?</h3>
                        <p className="text-slate-400 mb-6">¿Estás seguro de que quieres salir de tu cuenta?</p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-red-900/20"
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
