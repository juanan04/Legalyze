import { useState, useRef, useEffect, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AccordionCard from "../../components/common/AccordionCard";
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

            analysisResult.risks.forEach((risk, idx) => {
                if (risk.quote) quotesToSearch.push({ text: risk.quote, id: `risk-${idx}` });
            });

            analysisResult.keyClauses.forEach((clause, idx) => {
                if (clause.clauseText) quotesToSearch.push({ text: clause.clauseText, id: `clause-${idx}` });
            });

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

        } catch (err) {
            console.error(err);
            setError("Error al generar la vista previa. Inténtalo de nuevo.");
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

                                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={handleAnalyze}
                                            className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Zap className="w-5 h-5" />
                                            Analizar con IA (1 Crédito)
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
                            </section>
                        )}
                    </div>
                )}

                {/* Split View Results */}
                {analysisResult && file && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
                        {/* Left Column: Analysis */}
                        <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-20">
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
                                            <div key={index} className="border-b border-slate-700 pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-semibold text-red-300">{risk.title} ({risk.severity})</h4>
                                                    {risk.quote && pageLocations[risk.quote] && (
                                                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                                            Pág. {pageLocations[risk.quote].page}{pageLocations[risk.quote].line ? `, Lín. ${pageLocations[risk.quote].line}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1">{risk.description}</p>
                                                {risk.quote && pageLocations[risk.quote]?.originalText && (
                                                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-400 italic border-l-2 border-red-500">
                                                        "{pageLocations[risk.quote].originalText}"
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400">No se detectaron riesgos.</p>
                                    )}
                                </div>
                            </AccordionCard>

                            {/* Letra pequeña */}
                            <AccordionCard
                                title="Cláusulas Importantes"
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
                                            <div key={index} className="border-b border-slate-700 pb-4 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-semibold text-slate-200">{clause.title}</h4>
                                                    {clause.clauseText && pageLocations[clause.clauseText] && (
                                                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                                            Pág. {pageLocations[clause.clauseText].page}{pageLocations[clause.clauseText].line ? `, Lín. ${pageLocations[clause.clauseText].line}` : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1">{clause.description}</p>
                                                {clause.clauseText && (
                                                    <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs text-slate-400 italic border-l-2 border-amber-500">
                                                        "{pageLocations[clause.clauseText]?.originalText || clause.clauseText}"
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-400">No se encontraron cláusulas importantes.</p>
                                    )}
                                </div>
                            </AccordionCard>
                        </div>

                        {/* Right Column: PDF Viewer */}
                        <div className="h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                            <PdfViewer
                                file={file}
                            />
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AnalyzeContractPage;
