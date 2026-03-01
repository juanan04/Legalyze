import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Lock, Upload, FileText, AlertCircle, X, FileSearch, Zap, Download, CheckCircle } from "lucide-react";
import { PdfViewer } from "../../components/analysis/PdfViewer";
import { AnalysisReport } from "../../components/analysis/AnalysisReport";
import { PDFDownloadLink } from "@react-pdf/renderer";
import type { AnalysisResult } from "../../types/analysis";
import { pdfjs } from 'react-pdf';

// Ensure worker is configured (if not already by PdfViewer)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface PreviewResult {
    pageCount: number;
    wordCount: number;
    detectedSections: string[];
    basicChecklist: Record<string, boolean>;
    previewText: string;
}

interface TextItem {
    str: string;
    transform: number[]; // [scaleX, skewY, skewX, scaleY, x, y]
    hasEOL: boolean;
}

interface PageLocation {
    page: number;
    line?: number;
    originalText?: string;
}

const normalizeText = (text: string) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, ""); // Remove spaces
};

const AnalyzeContractPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [pageLocations, setPageLocations] = useState<Record<string, PageLocation>>({});

    // Scan PDF for quotes when analysis result is available
    useEffect(() => {
        const scanPdfForQuotes = async () => {
            if (!file || !analysisResult) return;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument(arrayBuffer).promise;
            const locations: Record<string, PageLocation> = {};

            // Collect all quotes to search
            const quotesToSearch: { text: string, id: string }[] = [];

            if (analysisResult.detailedAnalysis) {
                analysisResult.detailedAnalysis.forEach((detail, idx) => {
                    if (detail.originalClause) quotesToSearch.push({ text: detail.originalClause, id: `clause-${idx}` });
                });
            }

            // Search pages
            for (let i = 1; i <= pdf.numPages; i++) {
                try {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();

                    // Reconstruct text with line information
                    const pageText = textContent.items.map((item: any) => item.str).join('');
                    const cleanPageText = normalizeText(pageText);

                    quotesToSearch.forEach(quoteItem => {
                        if (locations[quoteItem.text]) return; // Already found

                        const cleanQuote = normalizeText(quoteItem.text);
                        // Check if quote is in page (accent insensitive)
                        if (cleanPageText.includes(cleanQuote)) {
                            // Found the page! Now try to find the line.
                            let foundLine = -1;
                            let originalText = quoteItem.text;

                            // 1. Group items into lines
                            const lines: { text: string, clean: string }[] = [];
                            let currentLineText = "";
                            let currentY = -1;

                            const items = textContent.items as TextItem[];

                            for (const item of items) {
                                const itemY = Math.round(item.transform[5]);
                                if (currentY !== -1 && Math.abs(itemY - currentY) > 5) {
                                    // New line
                                    lines.push({ text: currentLineText, clean: normalizeText(currentLineText) });
                                    currentLineText = "";
                                }
                                currentY = itemY;
                                currentLineText += item.str;
                            }
                            if (currentLineText) lines.push({ text: currentLineText, clean: normalizeText(currentLineText) });

                            // 2. Search in lines
                            const quoteStart = cleanQuote.substring(0, Math.min(cleanQuote.length, 20));

                            for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                                const line = lines[lineIdx];
                                if (line.clean.includes(quoteStart)) {
                                    foundLine = lineIdx + 1;
                                    // Capture the original text from the line (or at least the line itself)
                                    // This helps fix encoding issues in display
                                    originalText = line.text;
                                    break;
                                }
                            }

                            locations[quoteItem.text] = {
                                page: i,
                                line: foundLine > 0 ? foundLine : undefined,
                                originalText: originalText
                            };
                        }
                    });
                } catch (e) {
                    console.error("Error scanning page", i, e);
                }
            }

            setPageLocations(locations);
        };

        scanPdfForQuotes();
    }, [analysisResult, file]);

    useEffect(() => {
        if (location.state?.pendingFile && !file) {
            validateAndUpload(location.state.pendingFile);
            // Clear the state so it doesn't re-trigger on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, file]);

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
        if (selectedFile.size > 15 * 1024 * 1024) {
            setError("El archivo es demasiado grande. El tamaño máximo es 15MB.");
            return;
        }

        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(selectedFile.type)) {
            setError("Formato no soportado. Solo se aceptan archivos PDF y DOCX.");
            return;
        }

        setFile(selectedFile);
        handlePreview(selectedFile);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndUpload(e.target.files[0]);
        }
    };

    const handlePreview = async (fileToUpload: File) => {
        setIsAnalyzing(true);
        setProgress(0);
        setError(null);
        setPreviewResult(null);
        setAnalysisResult(null);

        try {
            const formData = new FormData();
            formData.append("file", fileToUpload);

            const response = await api.post("/api/contracts/preview", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setPreviewResult(response.data);
            setIsAnalyzing(false);

        } catch (err: any) {
            console.error(err);
            // Mostrar mensaje del backend si existe (ej: "Archiva demasiado grande")
            if (err.message && err.message !== "Network Error") {
                setError(err.message);
            } else {
                setError("Error al generar la vista previa. Inténtalo de nuevo.");
            }
            setIsAnalyzing(false);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setProgress(0);
        setError(null);
        setPageLocations({}); // Reset locations

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
            formData.append("file", file);

            const response = await api.post("/api/contracts/analyze", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const profileRes = await api.get("/api/users/me");
            updateUser(profileRes.data);

            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setIsAnalyzing(false);
                setAnalysisResult(response.data);
            }, 500);

        } catch (err: any) {
            clearInterval(interval);
            console.error(err);

            const errorMessage = err.response?.data?.message || err.message || "Hubo un error al analizar el contrato.";

            if (
                err.response?.data?.code === "NO_CREDITS" ||
                errorMessage === "NO_CREDITS" ||
                errorMessage.toLowerCase().includes("créditos") ||
                errorMessage.toLowerCase().includes("credits")
            ) {
                setError("NO_CREDITS");
            } else {
                setError(errorMessage);
            }
            setIsAnalyzing(false);
        }
    };



    if (!user?.emailVerified) {
        return (
            <DashboardLayout>
                <div className="relative min-h-[60vh] flex items-center justify-center">
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={`max-w-7xl mx-auto px-4 py-6 ${analysisResult ? 'h-[calc(100vh-100px)]' : ''}`}>



                {/* Header */}
                <header className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                        >
                            ←
                        </button>
                        <h1 className="text-2xl font-bold text-white">
                            {analysisResult ? 'Resultados del Análisis' : 'Analizar contrato'}
                        </h1>
                    </div>

                    {analysisResult && (
                        <div className="flex gap-3">
                            <PDFDownloadLink
                                document={<AnalysisReport result={analysisResult} />}
                                fileName={`reporte-${analysisResult.originalFileName}.pdf`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="w-4 h-4" />
                                        {loading ? 'Generando...' : 'Descargar Reporte'}
                                    </>
                                )}
                            </PDFDownloadLink>
                            <button
                                onClick={() => {
                                    setAnalysisResult(null);
                                    setFile(null);
                                    setPreviewResult(null);
                                    setProgress(0);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                            >
                                Nuevo Análisis
                            </button>
                        </div>
                    )}
                </header>

                {/* Upload & Preview Section (Only visible if no result) */}
                {!analysisResult && (
                    <div className="max-w-3xl mx-auto space-y-10">
                        {!previewResult && !isAnalyzing && (
                            <section className="text-center space-y-6">
                                {error && (
                                    <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3 text-left animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p className="text-sm">{error}</p>
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
                                            Soporta PDF y DOCX hasta 15MB
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {isAnalyzing && (
                            <section className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <p className="font-semibold text-slate-200">
                                        {previewResult ? "Analizando con IA..." : "Generando vista previa..."}
                                    </p>
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

                        {previewResult && !isAnalyzing && (
                            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <FileSearch className="w-6 h-6 text-blue-500" />
                                            Vista Previa del Documento
                                        </h2>
                                        <span className="text-sm text-slate-400">{file?.name}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-white">{previewResult.pageCount}</p>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider">Páginas</p>
                                            </div>
                                            <div className="bg-slate-800/50 p-4 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-white">{previewResult.wordCount}</p>
                                                <p className="text-xs text-slate-400 uppercase tracking-wider">Palabras</p>
                                            </div>
                                        </div>

                                        {/* Basic Checklist */}
                                        <div className="bg-slate-800/30 p-4 rounded-lg">
                                            <h3 className="text-sm font-semibold text-slate-300 mb-3">Datos Detectados</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(previewResult.basicChecklist).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        {value ? (
                                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-slate-600" />
                                                        )}
                                                        <span className={`text-sm ${value ? 'text-slate-200' : 'text-slate-500'}`}>
                                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Detected Sections */}
                                        <div className="col-span-1 md:col-span-2 bg-slate-800/30 p-4 rounded-lg">
                                            <h3 className="text-sm font-semibold text-slate-300 mb-3">
                                                Secciones Identificadas ({previewResult.detectedSections.length})
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {previewResult.detectedSections.length > 0 ? (
                                                    previewResult.detectedSections.map((section, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md border border-blue-500/30">
                                                            {section}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-slate-500 italic">No se detectaron secciones claras</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5" />
                                            {error === "NO_CREDITS" ? "No tienes créditos suficientes" : error}
                                        </div>
                                    )}

                                    <div className="pt-4 flex flex-col gap-4">
                                        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 p-4 rounded-lg flex items-center gap-3 text-sm">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <p>Este documento de <strong>{previewResult.pageCount}</strong> páginas consumirá <strong>{previewResult.pageCount > 50 ? 5 : previewResult.pageCount >= 16 ? 3 : 1}</strong> crédito(s) de tu plan.</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                onClick={handleAnalyze}
                                                className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <Zap className="w-5 h-5" />
                                                Analizar con IA ({previewResult.pageCount > 50 ? 5 : previewResult.pageCount >= 16 ? 3 : 1} Créditos)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPreviewResult(null);
                                                    setFile(null);
                                                }}
                                                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* Split View Results */}
                {analysisResult && file && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                        <div className="flex flex-col gap-6 overflow-y-auto pr-2 pb-20">
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
                                <h3 className="text-xl font-bold text-white mb-4">Salud Legal</h3>
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <svg viewBox="0 0 36 36" className="w-full h-full">
                                        <path
                                            className="text-slate-700"
                                            strokeWidth="4"
                                            stroke="currentColor"
                                            fill="none"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className={
                                                (analysisResult.healthScore || 0) >= 80 ? "text-green-500" :
                                                    (analysisResult.healthScore || 0) >= 50 ? "text-yellow-500" : "text-red-500"
                                            }
                                            strokeWidth="4"
                                            strokeDasharray={`${analysisResult.healthScore || 0}, 100`}
                                            stroke="currentColor"
                                            fill="none"
                                            strokeLinecap="round"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-3xl font-bold text-white">{analysisResult.healthScore || 0}%</span>
                                    </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mt-4">
                                    <p className="text-lg font-semibold text-slate-200">{analysisResult.verdict || "Análisis completado"}</p>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="font-bold text-blue-400 mb-3 uppercase tracking-wider text-sm">Tipo de Contrato Detectado</h3>
                                <p className="text-slate-200 text-lg font-semibold">{analysisResult.contractType || "Contrato de Arrendamiento"}</p>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="font-bold text-blue-400 mb-3 uppercase tracking-wider text-sm">Resumen General</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.summary}</p>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="font-bold text-blue-400 mb-4 uppercase tracking-wider text-sm">Resumen de Hallazgos</h3>
                                <ul className="space-y-3">
                                    {(analysisResult.findingsSummary || []).map((finding, idx) => (
                                        <li key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                            <span className="text-blue-500 mt-0.5">✔</span>
                                            <span className="text-slate-300 text-sm">{finding}</span>
                                        </li>
                                    ))}
                                    {(!analysisResult.findingsSummary || analysisResult.findingsSummary.length === 0) && (
                                        <p className="text-slate-400 text-sm">No se documentaron hallazgos específicos.</p>
                                    )}
                                </ul>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="font-bold text-blue-400 mb-4 uppercase tracking-wider text-sm">Análisis Detallado</h3>
                                <div className="space-y-4">
                                    {(analysisResult.detailedAnalysis || []).map((detail, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border flex flex-col gap-3 ${detail.riskLevel?.toUpperCase() === 'CRÍTICO' ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-900/50 border-slate-700'}`}>
                                            <div className="flex justify-between items-start">
                                                <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded font-medium">{detail.location}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${detail.riskLevel?.toUpperCase() === 'CRÍTICO' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-500'}`}>{detail.riskLevel}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Cláusula Original (Extracto):</p>
                                                <p className="text-sm text-slate-300 italic border-l-2 border-slate-600 pl-3 py-1">"{detail.originalClause}"</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Riesgo Detectado:</p>
                                                <p className="text-sm text-slate-200">{detail.riskDetected}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-blue-400/80 mb-1">Propuesta de Redacción:</p>
                                                <p className="text-sm text-blue-200/90">{detail.proposedWording}</p>
                                            </div>
                                            {pageLocations[detail.originalClause] && (
                                                <div className="mt-2 text-xs text-slate-500">
                                                    Pág. {pageLocations[detail.originalClause].page}{pageLocations[detail.originalClause].line ? `, Lín. ${pageLocations[detail.originalClause].line}` : ''}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!analysisResult.detailedAnalysis || analysisResult.detailedAnalysis.length === 0) && (
                                        <p className="text-sm text-slate-400">No se encontraron cláusulas para analizar en detalle.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: PDF Viewer */}
                        <div className="h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                            <PdfViewer
                                file={file}
                            />
                        </div>
                    </div>
                )}
                {/* Disclaimer */}
                <div className="mt-8 text-center border-t border-slate-800 pt-6">
                    <p className="text-xs text-slate-500">
                        Herramienta informativa basada en IA. No sustituye asesoramiento legal profesional.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AnalyzeContractPage;
