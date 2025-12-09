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

    return (
        <aside className="hidden lg:flex h-auto w-64 shrink-0 flex-col bg-[#020617] border-r border-slate-800">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Legalyze Logo" className="w-10 h-10 rounded-lg" />
                    <span className="text-xl font-semibold text-white">Legalyze</span>
                </div>
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
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg w-full text-left transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
