import React from 'react';
import { FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <FileText className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
                </div>

                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <p className="text-sm text-slate-500">Última actualización: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Introducción</h2>
                        <p>
                            Bienvenido a Legalyze. Estos Términos y Condiciones regulan el uso de nuestra plataforma y servicios. Al acceder o utilizar Legalyze, usted acepta estar legalmente vinculado por estos términos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Descripción del Servicio</h2>
                        <p>
                            Legalyze proporciona herramientas basadas en Inteligencia Artificial para el análisis y generación de borradores de contratos legales.
                            <strong>IMPORTANTE:</strong> Legalyze NO es un despacho de abogados y NO proporciona asesoramiento legal profesional. El uso de nuestros servicios no sustituye el consejo de un abogado cualificado.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Registro y Cuenta</h2>
                        <p>
                            Para utilizar ciertas funciones, debe registrarse y crear una cuenta. Usted es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Precios y Pagos</h2>
                        <p>
                            Algunos servicios son de pago (créditos). Los precios están indicados en la plataforma y pueden variar. Los pagos se procesan de forma segura a través de Stripe. No se realizan reembolsos por créditos ya consumidos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Propiedad Intelectual</h2>
                        <p>
                            Todo el contenido de la plataforma (software, diseños, textos) es propiedad de Legalyze o sus licenciantes. Usted conserva los derechos sobre los documentos que sube para su análisis.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">6. Limitación de Responsabilidad</h2>
                        <p>
                            Legalyze se proporciona "tal cual". No garantizamos que los resultados del análisis o generación de contratos sean 100% precisos, completos o adecuados para sus necesidades específicas. En ningún caso Legalyze será responsable por daños indirectos o consecuentes derivados del uso del servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">7. Modificaciones</h2>
                        <p>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor tras su publicación en la plataforma.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
