import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const PublicNavbar: React.FC = () => {
    return (
        <nav className="w-full p-6 flex justify-between items-center z-10 relative">
            <Link to="/" className="flex items-center gap-2 group">
                <img src={logo} alt="Legalyze Logo" className="w-10 h-10 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform" />
                <span className="text-xl font-bold text-white tracking-tight">Legalyze</span>
            </Link>

            <div className="flex items-center gap-4">
                <Link
                    to="/login"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm text-sm font-medium group"
                >
                    <span className="opacity-70 group-hover:opacity-100">🔐</span>
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                </Link>
                <Link
                    to="/register"
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200 text-sm font-bold shadow-lg shadow-blue-600/20"
                >
                    Registrarse
                </Link>
            </div>
        </nav>
    );
};

export default PublicNavbar;
