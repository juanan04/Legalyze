import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const PublicFooter: React.FC = () => {
    return (
        <footer className="w-full bg-[#020617] border-t border-white/10 pt-16 pb-8 px-4 md:px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-16">

                <div className="max-w-xs">
                    <Link to="/" className="flex items-center gap-3 mb-6">
                        <img src={logo} alt="Legalyze Logo" className="w-10 h-10 rounded-lg shadow-lg shadow-indigo-500/20" />
                        <span className="text-xl font-bold text-white tracking-tight">Legalyze</span>
                    </Link>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        El primer auditor de contratos inmobiliarios impulsado por Inteligencia Artificial y entrenado en el marco legal español.
                    </p>
                    <div className="text-slate-500 text-sm font-medium">
                        Hecho con rigor en España.
                    </div>
                </div>

                <div className="flex flex-wrap gap-12 md:gap-24">
                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-bold mb-2">Producto</h4>
                        <a href="#features" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Características</a>
                        <a href="#pricing" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Precios</a>
                        <Link to="/register" className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">Probar Gratis</Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-white font-bold mb-2">Legal</h4>
                        <Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Política de Privacidad</Link>
                        <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Términos y Condiciones</Link>
                        <Link to="/cookies" className="text-sm text-slate-400 hover:text-white transition-colors">Política de Cookies</Link>
                        <Link to="/disclaimer" className="text-sm text-slate-400 hover:text-white transition-colors">Aviso Legal</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Legalyze. Todos los derechos reservados. Beta v1.0.0
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
