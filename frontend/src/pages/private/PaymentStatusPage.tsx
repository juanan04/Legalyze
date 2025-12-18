import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const PaymentStatusPage = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth();

    const isSuccess = window.location.pathname.includes("success");
    const status = isSuccess ? "success" : "cancel";

    useEffect(() => {
        if (isSuccess) {
            let attempts = 0;
            const maxAttempts = 5;

            const checkCredits = async () => {
                try {
                    const res = await api.get("/api/users/me");
                    updateUser(res.data);

                    // If we have a way to know previous credits, we could compare. 
                    // For now, we just fetch a few times to ensure we get the latest.
                    if (attempts < maxAttempts) {
                        attempts++;
                        setTimeout(checkCredits, 2000); // Poll every 2 seconds
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };

            checkCredits();
        }
    }, [isSuccess, updateUser]);

    return (
        <DashboardLayout>
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
                    {status === "success" ? (
                        <>
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">¡Pago realizado con éxito!</h1>
                            <p className="text-slate-400 mb-8">
                                Tus créditos han sido añadidos a tu cuenta. Ya puedes empezar a analizar y generar contratos.
                            </p>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                            >
                                Ir al Dashboard
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Pago cancelado</h1>
                            <p className="text-slate-400 mb-8">
                                El proceso de pago ha sido cancelado. No se ha realizado ningún cargo en tu tarjeta.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate("/pricing")}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                                >
                                    Intentar de nuevo
                                </button>
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    className="flex-1 border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                                >
                                    Dashboard
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaymentStatusPage;
