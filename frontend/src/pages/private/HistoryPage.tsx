import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { api } from "../../lib/api";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AnalysisReport } from "../../components/analysis/AnalysisReport";
import { Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";


export interface DetailedAnalysis {
    location: string;
    originalClause: string;
    riskDetected: string;
    proposedWording: string;
    riskLevel: string;
}

interface AnalyzedContractDetail {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    contractType?: string;
    summary: string;
    healthScore: number;
    verdict: string;
    findingsSummary: string[];
    detailedAnalysis: DetailedAnalysis[];
}

type DetailData = AnalyzedContractDetail;

interface HistoryItem {
    id: number;
    title: string;
    date: string; // ISO string
    status: string;
}

interface AnalyzedContract {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    summary: string;
}

interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

const HistoryPage = () => {
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<DetailData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await api.get<Page<AnalyzedContract>>(`/api/contracts/analysis?page=${page}&size=10`);
                const items: HistoryItem[] = res.data.content.map((item) => ({
                    id: item.id,
                    title: item.originalFileName,
                    date: item.uploadedAt,
                    status: item.status === "COMPLETED" ? "Analizado" : item.status,
                }));
                setHistoryItems(items);
                setTotalPages(res.data.totalPages);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [page]);

    const fetchDetails = async (item: HistoryItem) => {
        setSelectedItem(item);
        setDetailLoading(true);
        setDetailData(null);
        try {
            const res = await api.get(`/api/contracts/analysis/${item.id}`);
            setDetailData(res.data);
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedItem(null);
        setDetailData(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        Historial de contratos
                    </h2>
                </header>

                {/* Lista de contratos */}
                {isLoading ? (
                    <div className="text-center text-slate-400 py-10">Cargando historial...</div>
                ) : historyItems.length > 0 ? (
                    <div className="space-y-4">
                        {historyItems.map((contract) => (
                            <div
                                key={contract.id}
                                className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center hover:border-slate-700 transition-colors"
                            >
                                <div className="md:col-span-2">
                                    <h3 className="font-semibold text-slate-50 text-sm md:text-base flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        {contract.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1 pl-6">
                                        {formatDate(contract.date)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-start md:justify-center">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium 
                                            bg-green-900/50 text-green-200 border border-green-800
                                            `}
                                    >
                                        {contract.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 justify-start md:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => fetchDetails(contract)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs md:text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer border border-slate-700"
                                    >
                                        Ver detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 border border-slate-800">
                            <span className="text-3xl text-[#2563EB]">📄</span>
                        </div>
                        <h3 className="mt-6 text-xl font-semibold text-white">
                            No hay contratos analizados
                        </h3>
                        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                            Comienza analizando tu primer documento legal para
                            verlo aquí.
                        </p>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-slate-400">
                            Página <span className="text-white font-medium">{page + 1}</span> de <span className="text-white font-medium">{totalPages}</span>
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Modal de Detalles */}
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                                <h3 className="text-xl font-bold text-white">
                                    Detalles del Contrato
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-6">
                                {detailLoading ? (
                                    <div className="text-center py-10 text-slate-400">
                                        Cargando detalles...
                                    </div>
                                ) : detailData ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                Información General
                                            </h4>
                                            <p className="text-slate-300 break-all">
                                                <span className="font-medium text-slate-500">Título:</span>{" "}
                                                {selectedItem.title}
                                            </p>
                                            <p className="text-slate-300">
                                                <span className="font-medium text-slate-500">Fecha:</span>{" "}
                                                {formatDate(selectedItem.date)}
                                            </p>
                                            <p className="text-slate-300">
                                                <span className="font-medium text-slate-500">Tipo:</span>{" "}
                                                {detailData.contractType ? detailData.contractType : "Documento Analizado"}
                                            </p>
                                        </div>

                                        <div>
                                            <div className="flex justify-end">
                                                <PDFDownloadLink
                                                    document={
                                                        <AnalysisReport
                                                            result={detailData as AnalyzedContractDetail}
                                                        />
                                                    }
                                                    fileName={`reporte-${(detailData as AnalyzedContractDetail).originalFileName}.pdf`}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                                                >
                                                    {({ loading }) => (
                                                        <>
                                                            <Download className="w-4 h-4" />
                                                            {loading ? 'Generando...' : 'Descargar Reporte PDF'}
                                                        </>
                                                    )}
                                                </PDFDownloadLink>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                                                    <h4 className="text-sm font-semibold text-slate-300 mb-2 text-center w-full border-b border-slate-700 pb-2">Salud Legal</h4>
                                                    <span className={`text-4xl font-bold mt-2 ${(detailData.healthScore || 0) >= 80 ? 'text-green-500' :
                                                        (detailData.healthScore || 0) >= 50 ? 'text-yellow-500' : 'text-red-500'
                                                        }`}>
                                                        {detailData.healthScore || 0}%
                                                    </span>
                                                </div>
                                                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                    <h4 className="text-sm font-semibold text-slate-300 mb-2 border-b border-slate-700 pb-2">Veredicto</h4>
                                                    <p className="text-sm text-slate-200 mt-2 font-medium">{detailData.verdict}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                    Resumen General
                                                </h4>
                                                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                    {(detailData as AnalyzedContractDetail).summary}
                                                </p>
                                            </div>

                                            {(detailData as AnalyzedContractDetail).findingsSummary && (detailData as AnalyzedContractDetail).findingsSummary.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                        Resumen de Hallazgos
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {(detailData as AnalyzedContractDetail).findingsSummary.map((finding, idx) => (
                                                            <li key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex gap-3 text-sm text-slate-300">
                                                                <span className="text-blue-500 font-bold">✓</span> {finding}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {(detailData as AnalyzedContractDetail).detailedAnalysis && (detailData as AnalyzedContractDetail).detailedAnalysis.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                        Análisis Detallado
                                                    </h4>
                                                    <ul className="space-y-4">
                                                        {(detailData as AnalyzedContractDetail).detailedAnalysis.map((detail, idx) => (
                                                            <li key={idx} className={`border rounded-xl p-4 flex flex-col gap-2 ${detail.riskLevel?.toUpperCase() === 'CRÍTICO' ? 'bg-red-900/10 border-red-900/50' : 'bg-slate-800 border-slate-700'}`}>
                                                                <div className="flex justify-between items-start">
                                                                    <span className="text-xs font-semibold bg-slate-700 text-white px-2 py-1 rounded">{detail.location}</span>
                                                                    <span className={`text-xs font-bold px-2 py-1 rounded ${detail.riskLevel?.toUpperCase() === 'CRÍTICO' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-500'}`}>{detail.riskLevel}</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Cláusula Original:</p>
                                                                    <p className="text-sm text-slate-300 italic">"{detail.originalClause}"</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Riesgo Detectado:</p>
                                                                    <p className="text-sm text-slate-200">{detail.riskDetected}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-blue-400/80">Propuesta:</p>
                                                                    <p className="text-sm text-blue-200/90">{detail.proposedWording}</p>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-red-400">
                                        No se pudieron cargar los detalles.
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-slate-800 bg-slate-900 rounded-b-xl flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium cursor-pointer"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default HistoryPage;
