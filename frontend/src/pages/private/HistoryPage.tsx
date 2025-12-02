import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

type ContractStatus = "GENERATED" | "ANALYZED" | "SIGNED";

interface ContractItem {
    id: number;
    title: string;
    counterpart: string;
    dateLabel: string; // "Fecha de Creación", "Fecha de Análisis", etc.
    date: string;      // "15/08/2024"
    status: ContractStatus;
}

const mockContracts: ContractItem[] = [
    {
        id: 1,
        title: "Contrato de Arrendamiento",
        counterpart: "Inmobiliaria Central",
        dateLabel: "Fecha de Creación",
        date: "15/08/2024",
        status: "GENERATED",
    },
    {
        id: 2,
        title: "Acuerdo de Confidencialidad",
        counterpart: "Tech Innovations S.A.",
        dateLabel: "Fecha de Análisis",
        date: "12/08/2024",
        status: "ANALYZED",
    },
    {
        id: 3,
        title: "Contrato de Prestación de Servicios",
        counterpart: "Freelancer Creativo",
        dateLabel: "Fecha de Firma",
        date: "05/07/2024",
        status: "SIGNED",
    },
];

const statusConfig: Record<
    ContractStatus,
    { label: string; badgeClasses: string }
> = {
    GENERATED: {
        label: "Generado",
        badgeClasses:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    ANALYZED: {
        label: "Analizado",
        badgeClasses:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    SIGNED: {
        label: "Firmado",
        badgeClasses:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    },
};

const HistoryPage = () => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    // Por ahora filtrado muy simple, solo por título / contraparte
    const filteredContracts = mockContracts.filter(
        (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.counterpart.toLowerCase().includes(search.toLowerCase())
    );

    const showEmptyState = filteredContracts.length === 0;

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        Historial de contratos
                    </h2>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                            type="button"
                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400"
                        >
                            {/* Filtro (futuro) */}
                            ⚙️
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/contracts/generate")}
                            className="bg-[#2563EB] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors"
                        >
                            + Nuevo contrato
                        </button>
                    </div>
                </header>

                {/* Buscador */}
                <div className="relative mb-8">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, tipo o contraparte..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-lg bg-slate-900/80 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                    />
                </div>

                {/* Lista de contratos */}
                {!showEmptyState && (
                    <div className="space-y-4">
                        {filteredContracts.map((contract) => {
                            const config = statusConfig[contract.status];

                            return (
                                <div
                                    key={contract.id}
                                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
                                >
                                    <div className="md:col-span-2">
                                        <h3 className="font-semibold text-slate-50 text-sm md:text-base">
                                            {contract.title}
                                        </h3>
                                        <p className="text-xs md:text-sm text-slate-400">
                                            Contraparte: {contract.counterpart}
                                        </p>
                                        <p className="text-xs md:text-sm text-slate-500 mt-1">
                                            {contract.dateLabel}: {contract.date}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-start md:justify-center">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${config.badgeClasses}`}
                                        >
                                            {config.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 justify-start md:justify-end">
                                        <button
                                            type="button"
                                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                                        >
                                            ⬇
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-[#2563EB] text-white text-xs md:text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors"
                                        >
                                            Ver detalles
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty state (cuando no hay resultados) */}
                {showEmptyState && (
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
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/contracts/generate")}
                                className="bg-[#2563EB] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#1D4ED8] transition-colors"
                            >
                                Generar nuevo contrato
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default HistoryPage;
