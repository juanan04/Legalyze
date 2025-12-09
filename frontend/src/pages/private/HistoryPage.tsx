import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { api } from "../../lib/api";

type ContractType = "GENERATED" | "ANALYZED";

interface ClauseDto {
    title: string;
    description: string;
    clauseText?: string;
    riskLevel?: string;
}

interface RiskDto {
    title: string;
    description: string;
    severity: string;
}

interface GeneratedContractDetail {
    id: number;
    templateCode: string;
    createdAt: string;
    generatedText: string;
    downloadUrl: string;
}

interface AnalyzedContractDetail {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    summary: string;
    keyClauses: ClauseDto[];
    risks: RiskDto[];
}

type DetailData = GeneratedContractDetail | AnalyzedContractDetail;

interface HistoryItem {
    id: number;
    type: ContractType;
    title: string;
    date: string; // ISO string
    status: string;
}

interface GeneratedContract {
    id: number;
    templateCode: string;
    templateName: string;
    createdAt: string;
}

interface AnalyzedContract {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    summary: string;
}

const HistoryPage = () => {
    const [search, setSearch] = useState("");
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<DetailData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [generatedRes, analyzedRes] = await Promise.all([
                    api.get<GeneratedContract[]>("/api/generated-contracts"),
                    api.get<AnalyzedContract[]>("/api/contracts/analysis"),
                ]);

                const generatedItems: HistoryItem[] = generatedRes.data.map((item) => ({
                    id: item.id,
                    type: "GENERATED",
                    title: item.templateName || item.templateCode,
                    date: item.createdAt,
                    status: "Generado",
                }));

                const analyzedItems: HistoryItem[] = analyzedRes.data.map((item) => ({
                    id: item.id,
                    type: "ANALYZED",
                    title: item.originalFileName,
                    date: item.uploadedAt,
                    status: item.status === "COMPLETED" ? "Analizado" : item.status,
                }));

                const allItems = [...generatedItems, ...analyzedItems].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                setHistoryItems(allItems);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchDetails = async (item: HistoryItem) => {
        setSelectedItem(item);
        setDetailLoading(true);
        setDetailData(null);
        try {
            if (item.type === "GENERATED") {
                const res = await api.get(`/api/generated-contracts/${item.id}`);
                setDetailData(res.data);
            } else {
                const res = await api.get(`/api/contracts/analysis/${item.id}`);
                setDetailData(res.data);
            }
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

    const filteredContracts = historyItems.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
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

                {/* Buscador */}
                <div className="relative mb-8">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                    />
                </div>

                {/* Lista de contratos */}
                {isLoading ? (
                    <div className="text-center text-slate-400 py-10">Cargando historial...</div>
                ) : filteredContracts.length > 0 ? (
                    <div className="space-y-4">
                        {filteredContracts.map((contract) => (
                            <div
                                key={`${contract.type}-${contract.id}`}
                                className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
                            >
                                <div className="md:col-span-2">
                                    <h3 className="font-semibold text-slate-50 text-sm md:text-base">
                                        {contract.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                                        {formatDate(contract.date)}
                                    </p>
                                </div>

                                <div className="flex items-center justify-start md:justify-center">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${contract.type === "GENERATED"
                                            ? "bg-blue-900 text-blue-200"
                                            : "bg-green-900 text-green-200"
                                            }`}
                                    >
                                        {contract.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 justify-start md:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => fetchDetails(contract)}
                                        className="bg-[#2563EB] text-white text-xs md:text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors"
                                    >
                                        Ver detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-16 text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-900">
                            <span className="text-3xl text-[#2563EB]">📄</span>
                        </div>
                        <h3 className="mt-6 text-xl font-semibold text-white">
                            Aún no tienes contratos
                        </h3>
                        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                            Comienza generando o analizando tu primer documento legal para
                            verlo aquí.
                        </p>
                    </div>
                )}

                {/* Modal de Detalles */}
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                                <h3 className="text-xl font-bold text-white">
                                    Detalles del Contrato
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-slate-400 hover:text-white transition-colors"
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
                                                {selectedItem.type === "GENERATED" ? "Generado" : "Analizado"}
                                            </p>
                                        </div>

                                        {selectedItem.type === "GENERATED" && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                    Contenido Generado
                                                </h4>
                                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                                                    {(detailData as GeneratedContractDetail).generatedText}
                                                </div>
                                                {(detailData as GeneratedContractDetail).downloadUrl && (
                                                    <div className="mt-4">
                                                        <a
                                                            href="#"
                                                            className="text-blue-400 hover:underline text-sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                // Trigger download logic here if needed, or just use the download button from previous page logic
                                                                // For now, let's just show the text
                                                            }}
                                                        >
                                                            {/* Download logic is complex to replicate here without the blob logic, 
                                                                but we display the text which is the requirement. 
                                                            */}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedItem.type === "ANALYZED" && (
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                                                        Resumen
                                                    </h4>
                                                    <p className="text-slate-300 text-sm leading-relaxed">
                                                        {(detailData as AnalyzedContractDetail).summary}
                                                    </p>
                                                </div>

                                                {(detailData as AnalyzedContractDetail).risks && (detailData as AnalyzedContractDetail).risks.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-red-400 mb-2">
                                                            Riesgos Detectados
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {(detailData as AnalyzedContractDetail).risks.map((risk, idx) => (
                                                                <li key={idx} className="bg-red-900/20 border border-red-900/50 rounded-lg p-3">
                                                                    <p className="text-red-200 font-medium text-sm">{risk.title}</p>
                                                                    <p className="text-red-300/80 text-xs mt-1">{risk.description}</p>
                                                                    <p className="text-red-400/60 text-xs mt-1">Severidad: {risk.severity}</p>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {(detailData as AnalyzedContractDetail).keyClauses && (detailData as AnalyzedContractDetail).keyClauses.length > 0 && (
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                                                            Letra Pequeña / Cláusulas Clave
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {(detailData as AnalyzedContractDetail).keyClauses.map((clause, idx) => (
                                                                <li key={idx} className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3">
                                                                    <p className="text-yellow-200 font-medium text-sm">{clause.title}</p>
                                                                    <p className="text-yellow-300/80 text-xs mt-1">{clause.description}</p>
                                                                    {clause.clauseText && (
                                                                        <p className="text-slate-400 text-xs mt-2 italic border-l-2 border-slate-600 pl-2">
                                                                            "{clause.clauseText}"
                                                                        </p>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                                    className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
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
