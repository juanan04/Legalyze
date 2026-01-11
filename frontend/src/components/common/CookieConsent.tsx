import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(() => {
        return !localStorage.getItem('cookieConsent');
    });

    useEffect(() => {
        // Effect removed as initialization is done in useState
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 md:p-6 z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-slate-300 text-sm md:text-base flex-1">
                    <p>
                        Utilizamos cookies propias y de terceros para mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias mediante el análisis de sus hábitos de navegación.
                        Si continúa navegando, consideramos que acepta su uso. Puede cambiar la configuración u obtener más información en nuestra{' '}
                        <Link to="/cookies" className="text-indigo-400 hover:text-indigo-300 underline">
                            Política de Cookies
                        </Link>.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Aceptar todas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
