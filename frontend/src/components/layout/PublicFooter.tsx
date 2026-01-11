import React from 'react';
import { Link } from 'react-router-dom';

const PublicFooter: React.FC = () => {
    return (
        <footer className="w-full bg-slate-900 border-t border-slate-800 py-8 px-4 md:px-6 mt-auto">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Legalyze. Todos los derechos reservados.
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                    <Link to="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
                    <Link to="/cookies" className="hover:text-white transition-colors">Política de Cookies</Link>
                    <Link to="/disclaimer" className="hover:text-white transition-colors">Aviso Legal</Link>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
