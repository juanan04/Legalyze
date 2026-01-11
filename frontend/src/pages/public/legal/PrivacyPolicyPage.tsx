import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Shield className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
                </div>

                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <p className="text-sm text-slate-500">Última actualización: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Responsable del Tratamiento</h2>
                        <p>
                            En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), le informamos que el responsable del tratamiento de sus datos personales es:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Identidad:</strong> Legalyze (Juan Antonio Aragón)</li>
                            <li><strong>Email:</strong> ja.aragon@gmail.com</li>
                            {/* Add address/CIF if available */}
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. Finalidad del Tratamiento</h2>
                        <p>Tratamos la información que nos facilita con las siguientes finalidades:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Gestionar su registro y cuenta de usuario en la plataforma.</li>
                            <li>Prestar los servicios de análisis y generación de contratos mediante IA.</li>
                            <li>Gestionar los pagos y la facturación de los servicios.</li>
                            <li>Enviar comunicaciones relacionadas con el servicio o actualizaciones de seguridad.</li>
                            <li>Atender sus consultas y solicitudes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Legitimación</h2>
                        <p>La base legal para el tratamiento de sus datos es:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Ejecución de un contrato:</strong> Para la prestación de los servicios solicitados.</li>
                            <li><strong>Consentimiento:</strong> Para el envío de comunicaciones comerciales (si procede).</li>
                            <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y garantizar la seguridad.</li>
                            <li><strong>Cumplimiento legal:</strong> Para obligaciones fiscales y administrativas.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Destinatarios de los datos</h2>
                        <p>Sus datos no se cederán a terceros salvo obligación legal o cuando sea necesario para la prestación del servicio (encargados del tratamiento), como:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Proveedores de servicios de pago (Stripe).</li>
                            <li>Proveedores de infraestructura tecnológica (Hosting, IA Providers como OpenAI/Google).</li>
                            <li>Proveedores de servicios de email (Resend).</li>
                        </ul>
                        <p className="mt-2">
                            Se realizan transferencias internacionales de datos a proveedores ubicados en EE.UU. bajo el marco del Data Privacy Framework o cláusulas contractuales tipo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">5. Derechos</h2>
                        <p>Usted tiene derecho a acceder, rectificar y suprimir los datos, así como otros derechos (limitación, portabilidad, oposición), enviando un email a ja.aragon@gmail.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
