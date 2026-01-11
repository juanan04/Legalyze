import React from 'react';
import { Cookie } from 'lucide-react';

const CookiesPolicyPage: React.FC = () => {
    const revokeConsent = () => {
        localStorage.removeItem('cookieConsent');
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Cookie className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Política de Cookies</h1>
                </div>

                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <p className="text-sm text-slate-500">Última actualización: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. ¿Qué son las cookies?</h2>
                        <p>
                            Una cookie es un pequeño fichero de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Tipos de cookies que utilizamos</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Cookies técnicas:</strong> Son necesarias para el funcionamiento de la web (ej: mantener la sesión iniciada, gestionar el carrito/créditos).</li>
                            <li><strong>Cookies de análisis:</strong> Nos permiten cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado (ej: Google Analytics).</li>
                            <li><strong>Cookies de preferencias:</strong> Permiten recordar información para que el usuario acceda al servicio con determinadas características (ej: idioma).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Gestión de cookies</h2>
                        <p>
                            Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador.
                        </p>
                        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <h3 className="font-medium text-white mb-2">Configuración actual</h3>
                            <p className="mb-4">
                                Puede revocar su consentimiento o cambiar sus preferencias en cualquier momento haciendo clic en el siguiente botón. Esto hará que vuelva a aparecer el banner de cookies.
                            </p>
                            <button
                                onClick={revokeConsent}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                            >
                                Restablecer preferencias de cookies
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CookiesPolicyPage;
