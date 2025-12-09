import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AccordionCard from "../../components/common/AccordionCard";
import { api } from "../../lib/api";

interface Clause {
    title: string;
    description: string;
    clauseText: string;
    riskLevel: string;
}

interface Risk {
    title: string;
    description: string;
    severity: string;
}

interface AnalysisResult {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    summary: string;
    keyClauses: Clause[];
    risks: Risk[];
}

const AnalyzeContractPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            handleUpload(selectedFile);
        }
    };

    const handleUpload = async (fileToUpload: File) => {
        setIsAnalyzing(true);
        setProgress(0);
        setError(null);
        setAnalysisResult(null);

        // Simulate progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    return prev;
                }
                return prev + 10;
            });
        }, 500);

        try {
            const formData = new FormData();
            formData.append("file", fileToUpload);

            const response = await api.post("/api/contracts/analyze", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            clearInterval(interval);
            setProgress(100);
            // Small delay to show 100% before showing results
            setTimeout(() => {
                setIsAnalyzing(false);
                setAnalysisResult(response.data);
            }, 500);

        } catch (err) {
            clearInterval(interval);
            console.error(err);
            setError("Hubo un error al analizar el contrato. Por favor intenta de nuevo.");
            setIsAnalyzing(false);
        }
    };

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
                {!analysisResult && !isAnalyzing && (
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

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf,.docx"
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex justify-center bg-[#2563EB] text-white text-sm font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-[#1D4ED8] transition-colors"
                        >
                            Subir contrato
                        </button>

                        {error && (
                            <p className="text-red-400 text-sm mt-4">{error}</p>
                        )}
                    </section>
                )}

                <hr className="border-slate-800" />

                {/* Progress */}
                {isAnalyzing && (
                    <section className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <p className="font-semibold text-slate-200">Analizando…</p>
                            <p className="text-[#2563EB] font-semibold">{progress}%</p>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                                className="h-2 rounded-full bg-[#2563EB]"
                                style={{ width: `${progress}%`, transition: "width 0.5s ease-in-out" }}
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            {file?.name}
                        </p>
                    </section>
                )}

                {/* Results */}
                {analysisResult && (
                    <>
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
                                    {analysisResult.summary}
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
                                    <div className="space-y-4">
                                        {analysisResult.keyClauses && analysisResult.keyClauses.length > 0 ? (
                                            analysisResult.keyClauses.map((clause, index) => (
                                                <div key={index} className="border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                                                    <h4 className="font-semibold text-slate-200">{clause.title}</h4>
                                                    <p className="text-sm text-slate-400">{clause.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400">No se encontraron cláusulas importantes.</p>
                                        )}
                                    </div>
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
                                    <div className="space-y-4">
                                        {analysisResult.risks && analysisResult.risks.length > 0 ? (
                                            analysisResult.risks.map((risk, index) => (
                                                <div key={index} className="border-b border-slate-700 pb-2 last:border-0 last:pb-0">
                                                    <h4 className="font-semibold text-red-300">{risk.title} ({risk.severity})</h4>
                                                    <p className="text-sm text-slate-400">{risk.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400">No se detectaron riesgos.</p>
                                        )}
                                    </div>
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

                        <section className="pt-2 flex justify-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setAnalysisResult(null);
                                    setFile(null);
                                    setProgress(0);
                                }}
                                className="text-slate-400 hover:text-white text-sm"
                            >
                                Analizar otro contrato
                            </button>
                        </section>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnalyzeContractPage;
