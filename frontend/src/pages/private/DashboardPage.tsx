import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
    FileText,
    Clock,
    User,
    UploadCloud,
    ArrowRight,
    Sparkles,
    CheckCircle2
} from "lucide-react";

interface AnalyzedContract {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    summary: string;
}

interface ActivityItem {
    id: number;
    type: "ANALYZED";
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
        let interval: ReturnType<typeof setInterval>;
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
                const [analyzedRes] = await Promise.all([
                    api.get<{ content: AnalyzedContract[] }>("/api/contracts/analysis"),
                ]);

                const analyzedItems: ActivityItem[] = analyzedRes.data.content.map((item) => ({
                    id: item.id,
                    type: "ANALYZED",
                    title: item.originalFileName,
                    date: item.uploadedAt,
                    status: item.status === "COMPLETED" ? "Analizado" : item.status,
                }));

                const recentItems = analyzedItems
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 4);

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

    const isFree = user?.subscriptionPlan === "FREE";
    const availableCredits = isFree && (user?.freeTrialsRemaining ?? 0) > 0
        ? user?.freeTrialsRemaining
        : user?.credits ?? 0;

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            navigate("/contracts/analyze", { state: { pendingFile: droppedFiles[0] } });
        }
    };

    return (
        <DashboardLayout>
            {/* Top Toolbar */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Dashboard overview
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/contracts/analyze")}
                        className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                    >
                        <Sparkles className="w-5 h-5" />
                        Nueva Auditoría
                    </button>
                    {/* Avatar */}
                    <div
                        className="w-11 h-11 rounded-full bg-slate-800 border-2 border-lime-300 flex items-center justify-center overflow-hidden cursor-pointer shrink-0"
                        onClick={() => navigate("/profile")}
                    >
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="font-bold text-lime-300">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Email Verification Warning */}
            {!user?.emailVerified && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8 flex items-start gap-4">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                        <User className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-yellow-500 mb-1">
                            Verifica tu correo electrónico
                        </h3>
                        <p className="text-slate-300 text-sm">
                            Para acceder a todas las funciones como analizar y generar contratos, necesitas verificar tu correo electrónico.
                            Revisa tu bandeja de entrada (y spam).
                            <br />
                            <span className="text-xs opacity-80 mt-1 block">
                                ¿Ya has verificado? Prueba a <button onClick={() => { localStorage.removeItem("auth_token"); localStorage.removeItem("auth_user"); window.location.href = "/login"; }} className="underline hover:text-white cursor-pointer font-bold">cerrar sesión</button> e iniciar de nuevo.
                            </span>
                        </p>
                        <div className="mt-3">
                            <button
                                onClick={handleResendEmail}
                                disabled={resendCooldown > 0 || isResending}
                                className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold"
                            >
                                {resendCooldown > 0
                                    ? `Reenviar en ${Math.floor(resendCooldown / 60)}:${(resendCooldown % 60).toString().padStart(2, '0')}`
                                    : isResending
                                        ? "Enviando..."
                                        : "Reenviar correo de verificación"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">

                {/* 1. ID CARD (Top Left) */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden h-[240px]">
                    {/* Glowing effect inside card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lime-300/10 blur-[50px] pointer-events-none rounded-full"></div>

                    <div>
                        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">
                            Plan actual: <span className="text-white">{user?.subscriptionPlan || 'FREE'}</span>
                        </h2>
                        <h3 className="text-2xl font-bold text-white leading-tight break-words max-w-[80%]">
                            {user?.name}
                        </h3>
                    </div>

                    <div className="bg-lime-300 p-4 rounded-2xl flex flex-col mt-4">
                        <span className="text-slate-900 font-bold text-sm">
                            {isFree ? "EVALUACIONES DE CORTESÍA" : "CRÉDITOS DISPONIBLES"}
                        </span>
                        <div className="text-4xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-1">
                            {availableCredits}
                        </div>
                    </div>
                </div>

                {/* 2. MAIN UPLOAD ZONE (Center Span 2) */}
                <div
                    onClick={() => navigate("/contracts/analyze")}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`md:col-span-2 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group h-[240px] ${isDragging
                        ? "bg-lime-300/10 border-lime-300 shadow-[0_0_30px_rgba(217,249,157,0.2)]"
                        : "bg-slate-900/50 border-slate-700 hover:border-lime-300/50 hover:bg-slate-800/50"
                        }`}
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${isDragging ? "bg-lime-300/30" : "bg-slate-800 group-hover:bg-lime-300/20"
                        }`}>
                        <UploadCloud className={`w-10 h-10 transition-colors ${isDragging ? "text-lime-300" : "text-slate-400 group-hover:text-lime-300"
                            }`} />
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 transition-colors ${isDragging ? "text-lime-300" : "text-white"
                        }`}>
                        {isDragging ? "¡Suelta el archivo aquí!" : "Sube un contrato para auditar"}
                    </h2>
                    <p className="text-slate-400 max-w-sm">
                        Haz clic aquí para ir al analizador. Sube tu PDF o DOCX y obtén tu informe de salud legal en segundos.
                    </p>
                </div>

                {/* 3. RECENT ACTIVITY (Bottom Left, Span 2) */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Últimos Análisis</h2>
                        <button
                            onClick={() => navigate("/history")}
                            className="text-slate-400 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1"
                        >
                            Ver todos <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-500 py-8">Cargando...</div>
                    ) : recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {recentActivity.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl hover:bg-slate-800/80 transition-colors group">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-lime-300" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white truncate text-sm sm:text-base">
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                <span className={`text-xs font-semibold ${item.status === 'Analizado' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate("/history")}
                                        className="shrink-0 p-2 text-slate-400 hover:text-lime-300 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-lime-300/10 cursor-pointer"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                            <Clock className="w-12 h-12 text-slate-700 mb-4" />
                            <p className="text-slate-400 font-medium">No hay actividad reciente</p>
                        </div>
                    )}
                </div>

                {/* 4. UPGRADE CENTER CARD (Bottom Right) */}
                <div className="bg-linear-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-indigo-400 transition-colors">
                    {/* Abstract tech shapes */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/30 transition-all"></div>
                    <div className="absolute top-4 right-4 text-indigo-400/50"><Sparkles className="w-12 h-12" /></div>

                    <div className="relative z-10 mb-8 mt-2">
                        {isFree ? (
                            <>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full mb-4 border border-indigo-500/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> RECOMENDADO
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight mb-2">Desbloquea todo el potencial</h3>
                                <p className="text-slate-300 text-sm">Pásate a Pro y audita sin límites.</p>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-300/20 text-lime-300 text-xs font-bold rounded-full mb-4 border border-lime-300/30">
                                    <Sparkles className="w-3.5 h-3.5" /> TOP-UP
                                </div>
                                <h3 className="text-2xl font-bold text-white leading-tight mb-2">¿Necesitas un extra?</h3>
                                <p className="text-slate-300 text-sm">Añade 10 créditos instántaneos a tu saldo.</p>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => navigate("/pricing")}
                        className={`relative z-10 w-full font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${isFree
                            ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/25"
                            : "bg-lime-300 hover:bg-lime-400 text-slate-900 shadow-lime-300/20"
                            }`}
                    >
                        {isFree ? "Actualizar Plan" : "Recargar Créditos"}
                    </button>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
