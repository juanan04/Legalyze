import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
    FileText,
    Plus,
    Package,
    Clock,
    User
} from "lucide-react";

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

interface ActivityItem {
    id: number;
    type: "GENERATED" | "ANALYZED";
    title: string;
    date: string;
    status: string;
}

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Resend Email State
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleResendEmail = async () => {
        if (!user?.email) return;
        try {
            setIsResending(true);
            await api.post("/api/auth/resend-verification", { email: user.email });
            setResendCooldown(90); // 1 minute 30 seconds
        } catch (error) {
            console.error("Error resending email:", error);
        } finally {
            setIsResending(false);
        }
    };

    useEffect(() => {
        const fetchActivity = async () => {
            setIsLoading(true);
            try {
                const [generatedRes, analyzedRes] = await Promise.all([
                    api.get<GeneratedContract[]>("/api/generated-contracts"),
                    api.get<AnalyzedContract[]>("/api/contracts/analysis"),
                ]);

                const generatedItems: ActivityItem[] = generatedRes.data.map((item) => ({
                    id: item.id,
                    type: "GENERATED",
                    title: item.templateName || item.templateCode,
                    date: item.createdAt,
                    status: "Generado",
                }));

                const analyzedItems: ActivityItem[] = analyzedRes.data.map((item) => ({
                    id: item.id,
                    type: "ANALYZED",
                    title: item.originalFileName,
                    date: item.uploadedAt,
                    status: item.status === "COMPLETED" ? "Analizado" : item.status,
                }));

                const allItems = [...generatedItems, ...analyzedItems];

                // Filter for last 48 hours
                const now = new Date();
                const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

                const recentItems = allItems
                    .filter((item) => new Date(item.date) > fortyEightHoursAgo)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3);

                setRecentActivity(recentItems);
            } catch (error) {
                console.error("Error fetching activity:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Hola, {user?.name}
                    </h1>
                    <p className="mt-1 text-slate-400">¿Qué quieres hacer hoy?</p>
                </div>

                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {/* Credits Display */}
                    <div
                        className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors"
                        onClick={() => navigate("/pricing")}
                    >
                        {(user?.freeTrialsRemaining ?? 0) > 0 ? (
                            <span className="text-emerald-400 font-medium text-sm">
                                ✨ {user?.freeTrialsRemaining} Prueba{user?.freeTrialsRemaining !== 1 ? 's' : ''} Gratuita{user?.freeTrialsRemaining !== 1 ? 's' : ''} Disponible{user?.freeTrialsRemaining !== 1 ? 's' : ''}
                            </span>
                        ) : (
                            <span className="text-blue-400 font-medium text-sm">
                                💳 Créditos: {user?.credits ?? 0} <span className="text-slate-500 text-xs ml-1">(Comprar)</span>
                            </span>
                        )}
                    </div>

                    {/* Avatar */}
                    <div
                        className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => navigate("/profile")}
                    >
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-bold text-orange-700">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Email Verification Warning */}
            {!user?.emailVerified && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8 flex items-start gap-4">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <User className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-500 mb-1">
                            Verifica tu correo electrónico
                        </h3>
                        <p className="text-slate-300 text-sm">
                            Para acceder a todas las funciones como analizar y generar contratos, necesitas verificar tu correo electrónico.
                            Revisa tu bandeja de entrada (y spam).
                            <br />
                            <span className="text-xs opacity-80 mt-1 block">
                                ¿Ya has verificado? Prueba a <button onClick={() => { localStorage.removeItem("auth_token"); localStorage.removeItem("auth_user"); window.location.href = "/login"; }} className="underline hover:text-white cursor-pointer">cerrar sesión</button> e iniciar de nuevo.
                            </span>
                            <div className="mt-3">
                                <button
                                    onClick={handleResendEmail}
                                    disabled={resendCooldown > 0 || isResending}
                                    className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {resendCooldown > 0
                                        ? `Reenviar en ${Math.floor(resendCooldown / 60)}:${(resendCooldown % 60).toString().padStart(2, '0')}`
                                        : isResending
                                            ? "Enviando..."
                                            : "Reenviar correo de verificación"}
                                </button>
                            </div>
                        </p>
                    </div>
                </div>
            )}

            {/* Tarjetas principales */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Analizar contrato */}
                <div
                    onClick={() => navigate("/contracts/analyze")}
                    className="group relative p-8 rounded-2xl overflow-hidden bg-linear-gradient-to-br from-indigo-400 to-purple-500 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 text-white">
                        <div className="w-14 h-14 mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Analizar contrato</h2>
                        <p className="opacity-80">Sube y revisa tus documentos.</p>
                    </div>
                </div>

                {/* Generar contrato */}
                <div
                    onClick={() => navigate("/contracts/generate")}
                    className="group relative p-8 rounded-2xl overflow-hidden bg-linear-gradient-to-br from-emerald-400 to-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 text-white">
                        <div className="w-14 h-14 mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Generar contrato</h2>
                        <p className="opacity-80">Crea un nuevo documento legal.</p>
                    </div>
                </div>
            </section>

            {/* Actividad reciente */}
            <section>
                <h2 className="text-2xl font-bold mb-6 text-white">
                    Actividad reciente
                </h2>

                {isLoading ? (
                    <div className="text-center text-slate-400 py-10">Cargando actividad...</div>
                ) : recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivity.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === "GENERATED" ? "bg-blue-900/50 text-blue-400" : "bg-green-900/50 text-green-400"
                                        }`}>
                                        {item.type === "GENERATED" ? <FileText className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-50 text-sm sm:text-base break-all">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {item.status} • {formatDate(item.date)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate("/history")}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    Ver en historial →
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="bg-slate-900/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                            <Package className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No hay actividad reciente
                        </h3>
                        <p className="text-slate-400 max-w-md">
                            Comienza por analizar o generar tu primer contrato para ver tu
                            historial aquí.
                        </p>
                    </div>
                )}

                {/* Links rápidos */}
                <div className="mt-6 space-y-4">
                    <div
                        onClick={() => navigate("/history")}
                        className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="font-semibold text-white">Mi historial</p>
                        </div>
                        <span className="text-slate-500">›</span>
                    </div>

                    <div
                        onClick={() => navigate("/profile")}
                        className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <User className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="font-semibold text-white">Mi perfil</p>
                        </div>
                        <span className="text-slate-500">›</span>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
};

export default DashboardPage;
