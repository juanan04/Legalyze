import { NavLink } from "react-router-dom";

const navItemBase =
    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors";
const navItemInactive =
    "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100";
const navItemActive = "bg-[#1f2937] text-white";

const Sidebar = () => {
    return (
        <aside className="hidden lg:flex h-screen w-64 shrink-0 flex-col bg-[#020617] border-r border-slate-800">
            {/* Logo */}
            <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">L</span>
                    </div>
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
                    <span>▤</span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink
                    to="/contracts/analyze"
                    className={({ isActive }) =>
                        `${navItemBase} ${isActive ? navItemActive : navItemInactive
                        }`
                    }
                >
                    <span>🔍</span>
                    <span>Analizar contrato</span>
                </NavLink>

                <NavLink
                    to="/contracts/generate"
                    className={({ isActive }) =>
                        `${navItemBase} ${isActive ? navItemActive : navItemInactive
                        }`
                    }
                >
                    <span>📄</span>
                    <span>Generar contrato</span>
                </NavLink>

                <NavLink
                    to="/history"
                    className={({ isActive }) =>
                        `${navItemBase} ${isActive ? navItemActive : navItemInactive
                        }`
                    }
                >
                    <span>⏱️</span>
                    <span>Mi historial</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                        `${navItemBase} ${isActive ? navItemActive : navItemInactive
                        }`
                    }
                >
                    <span>👤</span>
                    <span>Mi perfil</span>
                </NavLink>
            </nav>

            {/* Cerrar sesión */}
            <div className="p-4 mt-auto border-t border-slate-800">
                <button
                    type="button"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-lg w-full text-left transition-colors"
                >
                    <span>↩</span>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
