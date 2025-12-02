import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AccordionCard from "../../components/common/AccordionCard";

const AnalyzeContractPage = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-8 sm:py-10 lg:py-12 space-y-10">
                {/* Header */}
                <header className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Analizar contrato
                    </h1>
                </header>

                {/* Upload section */}
                <section className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-[#2563EB]/15 flex items-center justify-center">
                            <span className="text-4xl">📄</span>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white">
                            Sube un contrato para analizar
                        </h2>
                        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                            Sube tu archivo en formato PDF o DOCX para que Legalyze pueda
                            revisarlo por ti.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex justify-center bg-[#2563EB] text-white text-sm font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-[#1D4ED8] transition-colors"
                    >
                        Subir contrato
                    </button>
                </section>

                <hr className="border-slate-800" />

                {/* Progress (dummy) */}
                <section className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <p className="font-semibold text-slate-200">Analizando…</p>
                        <p className="text-[#2563EB] font-semibold">75%</p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                            className="h-2 rounded-full bg-[#2563EB]"
                            style={{ width: "75%" }}
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        Contrato_Alquiler_2024.pdf
                    </p>
                </section>

                <hr className="border-slate-800" />

                {/* Results */}
                <section className="space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                        Resultados del análisis
                    </h2>

                    <div className="space-y-4">
                        {/* Resumen general */}
                        <AccordionCard
                            title="Resumen general"
                            colorVariant="success"
                            defaultOpen
                            icon={
                                <div className="w-8 h-8 rounded-full bg-emerald-900/40 flex items-center justify-center">
                                    <span className="text-sm text-emerald-400">✔</span>
                                </div>
                            }
                        >
                            El contrato es estándar y no presenta cláusulas inusuales. Se han
                            identificado los puntos clave y 2 cláusulas de bajo riesgo en la
                            sección de letra pequeña.
                        </AccordionCard>

                        {/* Letra pequeña */}
                        <AccordionCard
                            title="Letra pequeña"
                            colorVariant="warning"
                            icon={
                                <div className="w-8 h-8 rounded-full bg-amber-900/40 flex items-center justify-center">
                                    <span className="text-sm text-amber-400">!</span>
                                </div>
                            }
                        >
                            Aquí podríamos mostrar las cláusulas menos visibles que conviene revisar
                            con más detalle.
                        </AccordionCard>

                        {/* Riesgos detectados */}
                        <AccordionCard
                            title="Riesgos detectados"
                            colorVariant="danger"
                            defaultOpen
                            icon={
                                <div className="w-8 h-8 rounded-full bg-red-900 flex items-center justify-center">
                                    <span className="text-sm text-red-400">⚠</span>
                                </div>
                            }
                        >
                            ¡Atención! Hemos encontrado 3 cláusulas de alto riesgo que requieren tu
                            atención inmediata. Se refieren a penalizaciones desproporcionadas por
                            terminación anticipada y a una renuncia a tus derechos de reclamación.
                        </AccordionCard>
                    </div>

                </section>

                {/* PDF button */}
                <section className="pt-2 flex justify-center">
                    <button
                        type="button"
                        className="w-full sm:w-auto bg-slate-800 text-slate-100 text-sm font-semibold py-3 px-8 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Generar reporte en PDF
                    </button>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default AnalyzeContractPage;
