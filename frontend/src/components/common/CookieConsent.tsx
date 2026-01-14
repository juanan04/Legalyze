import React, { useState } from 'react';

const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(() => {
        return !localStorage.getItem('cookieConsent');
    });

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
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 p-4 md:p-6 z-[9999] shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-slate-300 text-sm md:text-base flex-1">
                    <p>
                        Utilizamos cookies propias y de terceros para mejorar su experiencia y nuestros servicios.
                        Si continúa navegando, consideramos que acepta su uso.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-900/20 cursor-pointer"
                    >
                        Aceptar cookies
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
