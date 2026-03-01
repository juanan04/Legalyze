import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { ArrowLeft } from 'lucide-react';

const MinimalNavbar: React.FC = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className={`w-full p-6 flex items-center z-50 ${isAuthPage ? 'absolute top-0 left-0 border-none' : 'relative border-b border-slate-800 bg-[#0f172a]'}`}>
            <Link to="/" className="flex items-center gap-3 group text-slate-400 hover:text-white transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <img src={logo} alt="Legalyze Logo" className="w-8 h-8 rounded-md" />
                <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Legalyze</span>
            </Link>
        </nav>
    );
};

export default MinimalNavbar;
