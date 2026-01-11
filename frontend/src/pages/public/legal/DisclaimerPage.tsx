import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DisclaimerPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <AlertTriangle className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Aviso Legal y Exención de Responsabilidad</h1>
                </div>

                <div className="space-y-6 text-slate-300 leading-relaxed">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200 mb-6">
                        <strong>ADVERTENCIA IMPORTANTE:</strong> Legalyze es una herramienta de asistencia basada en Inteligencia Artificial. NO somos un despacho de abogados y NO prestamos servicios de asesoramiento jurídico profesional.
                    </div>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. Naturaleza del Servicio</h2>
                        <p>
                            La información, análisis y documentos generados por Legalyze tienen fines meramente informativos y orientativos. Aunque nos esforzamos por ofrecer resultados precisos, la Inteligencia Artificial puede cometer errores, omitir información relevante o malinterpretar contextos legales complejos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. No sustituye al asesoramiento profesional</h2>
                        <p>
                            El uso de esta plataforma no crea una relación abogado-cliente. Los resultados obtenidos no deben utilizarse como sustituto del asesoramiento legal profesional. Recomendamos encarecidamente que cualquier contrato o análisis generado sea revisado por un abogado cualificado antes de su firma o uso legal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Exención de Responsabilidad</h2>
                        <p>
                            Legalyze y sus propietarios no se hacen responsables de:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>La exactitud, integridad o vigencia de la información generada.</li>
                            <li>Cualquier pérdida o daño (directo, indirecto o consecuente) derivado del uso de la plataforma o de la confianza depositada en sus resultados.</li>
                            <li>El uso indebido de los documentos generados.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">4. Datos del Prestador</h2>
                        <p>
                            En cumplimiento de la LSSI-CE, se informa que el titular del sitio web es:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Nombre Comercial:</strong> Legalyze</li>
                            <li><strong>Email de contacto:</strong> ja.aragon@gmail.com</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default DisclaimerPage;
