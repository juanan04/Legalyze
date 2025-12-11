import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { CheckCircle, XCircle } from "lucide-react";

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verificando tu correo electrónico...");

    const verifyCalled = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Token de verificación no válido o faltante.");
            return;
        }

        if (verifyCalled.current) return;
        verifyCalled.current = true;

        const verify = async () => {
            try {
                await api.get(`/api/auth/verify?token=${token}`);
                setStatus("success");
                setMessage("¡Correo verificado exitosamente! Ahora puedes iniciar sesión.");
                setTimeout(() => navigate("/login"), 3000);
            } catch (error) {
                setStatus("error");
                if (error instanceof Error) {
                    setMessage(error.message);
                } else {
                    setMessage("El enlace de verificación ha expirado o no es válido.");
                }
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="flex justify-center mb-6">
                    {status === "loading" && (
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                    {status === "success" && (
                        <CheckCircle className="w-20 h-20 text-emerald-500" />
                    )}
                    {status === "error" && (
                        <XCircle className="w-20 h-20 text-red-500" />
                    )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                    {status === "loading" && "Verificando..."}
                    {status === "success" && "¡Verificado!"}
                    {status === "error" && "Error"}
                </h1>

                <p className="text-slate-400 mb-8">
                    {message}
                </p>

                {status !== "loading" && (
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Ir al inicio de sesión
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
