import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
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

import { useAuth } from "../../context/AuthContext";
import { Lock, Upload, FileText, AlertCircle, X } from "lucide-react";

const AnalyzeContractPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles[0]) {
            validateAndUpload(droppedFiles[0]);
        }
    };

    const validateAndUpload = (selectedFile: File) => {
        // Frontend validation
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("El archivo es demasiado grande. El tamaño máximo es 5MB.");
            return;
        }

        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Formato no soportado. Solo se aceptan archivos PDF y DOCX.");
            return;
        }

        setFile(selectedFile);
        handleUpload(selectedFile);
    };

    if (!user?.emailVerified) {
        return (
            <DashboardLayout>
                <div className="relative min-h-[60vh] flex items-center justify-center">
                    {/* Blurred Background Content */}
                    <div className="absolute inset-0 filter blur-sm opacity-50 pointer-events-none select-none">
                        <div className="max-w-3xl mx-auto py-8 sm:py-10 lg:py-12 space-y-10 p-8">
                            <header className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                    Analizar contrato
                                </h1>
                            </header>
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
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Overlay Message */}
                    <div className="relative z-10 bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md text-center">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Función Bloqueada</h2>
                        <p className="text-slate-400 mb-6">
                            Para analizar contratos con IA, necesitas verificar tu correo electrónico primero.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
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

            // Refresh user profile to update credits/freeAnalysisUsed
            const profileRes = await api.get("/api/users/me");
            updateUser(profileRes.data);

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
            if (err instanceof Error) {
                if (err.message === "NO_CREDITS") {
                    setError("NO_CREDITS");
                } else {
                    setError(err.message);
                }
            } else {
                setError("Hubo un error al analizar el contrato. Por favor intenta de nuevo.");
            }
            setIsAnalyzing(false);
        }
    };

    // Close error alert
    const closeError = () => setError(null);


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
                {/* Upload section */}
                {!analysisResult && !isAnalyzing && (
                    <section className="text-center space-y-6">

                        {/* Error Alert */}
                        {error && (
                            <div className={`border rounded-lg p-4 flex items-start gap-3 text-left ${error === "NO_CREDITS"
                                    ? "bg-blue-500/10 border-blue-500/50"
                                    : "bg-red-500/10 border-red-500/50"
                                }`}>
                                <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${error === "NO_CREDITS" ? "text-blue-500" : "text-red-500"
                                    }`} />
                                <div className="flex-1">
                                    <h3 className={`font-medium ${error === "NO_CREDITS" ? "text-blue-500" : "text-red-500"
                                        }`}>
                                        {error === "NO_CREDITS" ? "Sin créditos suficientes" : "Error"}
                                    </h3>

                                    {error === "NO_CREDITS" ? (
                                        <div className="mt-1">
                                            <p className="text-blue-400 text-sm mb-2">
                                                Has agotado tus créditos de análisis. Necesitas recargar para continuar.
                                            </p>
                                            <button
                                                onClick={() => navigate("/pricing")}
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Comprar créditos
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-red-400 text-sm mt-1">{error}</p>
                                    )}
                                </div>
                                <button onClick={closeError} className={`${error === "NO_CREDITS" ? "text-blue-400 hover:text-blue-300" : "text-red-400 hover:text-red-300"
                                    }`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 transition-colors ${isDragging
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-slate-700 hover:border-slate-600 bg-slate-900/50"
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-blue-500/20" : "bg-slate-800"
                                    }`}>
                                    <Upload className={`w-10 h-10 ${isDragging ? "text-blue-500" : "text-slate-400"
                                        }`} />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold text-white">
                                        Arrastra y suelta tu contrato aquí
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        o si prefieres
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
                                    className="inline-flex items-center gap-2 bg-[#2563EB] text-white text-sm font-semibold py-2.5 px-6 rounded-lg shadow-md hover:bg-[#1D4ED8] transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Seleccionar archivo
                                </button>

                                <p className="text-xs text-slate-500 pt-2">
                                    Soporta PDF y DOCX hasta 5MB
                                </p>
                            </div>
                        </div>
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
