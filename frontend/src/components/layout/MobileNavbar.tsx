import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    Search,
    FileText,
    Clock,
    User,
    LogOut,
    Menu,
    X
} from "lucide-react";
import logo from "../../assets/logo.png";

const MobileNavbar = () => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const navItemBase = "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors";
    const navItemInactive = "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100";
    const navItemActive = "bg-[#1f2937] text-white";

    return (
        <>
            {/* Top Bar */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#020617] border-b border-slate-800 sticky top-0 z-40">
                <NavLink to="/dashboard" className="flex items-center gap-3">
                    <img src={logo} alt="Legalyze Logo" className="w-8 h-8 rounded-lg" />
                    <span className="text-lg font-semibold text-white">Legalyze</span>
                </NavLink>
                <button
                    onClick={toggleMenu}
                    className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-30 bg-[#0f172a] pt-20 px-4 pb-6 overflow-y-auto animate-in slide-in-from-top-10 duration-200">
                    <nav className="space-y-2">
                        <NavLink
                            to="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/contracts/analyze"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                        >
                            <Search className="w-5 h-5" />
                            <span>Analizar contrato</span>
                        </NavLink>

                        <NavLink
                            to="/contracts/generate"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                        >
                            <FileText className="w-5 h-5" />
                            <span>Generar contrato</span>
                        </NavLink>

                        <NavLink
                            to="/history"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                        >
                            <Clock className="w-5 h-5" />
                            <span>Mi historial</span>
                        </NavLink>

                        <NavLink
                            to="/pricing"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                        >
                            <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">€</span>
                            <span>Comprar Créditos</span>
                        </NavLink>

                        <NavLink
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
                        >
                            <User className="w-5 h-5" />
                            <span>Mi perfil</span>
                        </NavLink>

                        <div className="pt-4 mt-4 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={handleLogoutClick}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg w-full text-left transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    </nav>
                </div>
            )}

            {/* Logout Confirmation Modal (Mobile) */}
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

export default MobileNavbar;
