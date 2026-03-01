import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const PublicNavbar: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={cn(
            "fixed top-0 inset-x-0 z-50 flex justify-center transition-all duration-300 pointer-events-none",
            scrolled ? "pt-4" : "pt-4 md:pt-6"
        )}>
            <nav className={cn(
                "pointer-events-auto flex justify-between items-center transition-all duration-300",
                scrolled
                    ? "w-[95%] max-w-4xl px-4 py-2 sm:px-6 sm:py-3 bg-slate-100/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50 text-slate-800"
                    : "w-full max-w-7xl px-4 py-3 sm:px-8 border-b border-transparent text-white"
            )}>
                {/* Logo Section */}
                <Link to="/" onClick={() => window.scrollTo(0, 0)} className="flex items-center gap-2 group cursor-pointer">
                    <img
                        src={logo}
                        alt="Legalyze Logo"
                        className={cn(
                            "rounded-lg transition-transform group-hover:scale-105",
                            scrolled ? "w-8 h-8 shadow-sm" : "w-10 h-10 shadow-lg shadow-indigo-500/20"
                        )}
                    />
                    <span className={cn(
                        "font-bold tracking-tight hidden sm:block",
                        scrolled ? "text-xl text-slate-900" : "text-xl text-white"
                    )}>
                        Legalyze
                    </span>
                </Link>

                {/* Center Links (Optional, shown if they fit) */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#features" className={cn("text-sm font-medium transition-colors", scrolled ? "text-slate-600 hover:text-indigo-600" : "text-slate-300 hover:text-white")}>Características</a>
                    <a href="#how-it-works" className={cn("text-sm font-medium transition-colors", scrolled ? "text-slate-600 hover:text-indigo-600" : "text-slate-300 hover:text-white")}>Cómo funciona</a>
                    <a href="#pricing" className={cn("text-sm font-medium transition-colors", scrolled ? "text-slate-600 hover:text-indigo-600" : "text-slate-300 hover:text-white")}>Precios</a>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 text-sm font-bold group",
                                scrolled
                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                            )}
                        >
                            <span>Ir al Dashboard</span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={cn(
                                    "hidden sm:flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium",
                                    scrolled
                                        ? "bg-slate-200/50 hover:bg-slate-200 text-slate-700"
                                        : "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white backdrop-blur-sm"
                                )}
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                className={cn(
                                    "flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-200 text-sm font-bold",
                                    scrolled
                                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                )}
                            >
                                Empezar ahora
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default PublicNavbar;
