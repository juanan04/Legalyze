import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await api.post("/api/auth/login", { email, password, rememberMe });

            const token: string = res.data.token;
            const user = res.data.user;

            if (token) {
                localStorage.setItem("token", token);
            } else {
                throw new Error("Error de autenticación: No se recibió token.");
            }

            login(token, user, rememberMe);
        } catch (err: unknown) {
            console.error("Login Error:", err);
            if (err instanceof Error) {
                if (err.message === "Bad credentials") {
                    setError("Contraseña o correo incorrectos.");
                } else {
                    setError(err.message);
                }
            } else {
                setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full min-h-screen">
            {/* Left Side (Form) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#0f172a] relative z-10 pt-24 lg:pt-0">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-white mb-3">
                            Bienvenido de vuelta
                        </h1>
                        <p className="text-slate-400 text-sm">
                            ¿No tienes una cuenta?{" "}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-600 text-indigo-500 focus:ring-indigo-500 bg-slate-800"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer">
                                    Recordar dispositivo
                                </label>
                            </div>
                            {/* <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                ¿Has olvidado tu contraseña?
                            </a> */}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 mt-6 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#0f172a] shadow-lg shadow-indigo-600/20 transition-all duration-200"
                        >
                            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                        </button>
                    </form>

                    <div className="mt-8">
                        <p className="text-xs text-center text-slate-500 leading-relaxed">
                            Al iniciar sesión, aceptas nuestra{" "}
                            <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-2">Política de Privacidad</Link>
                            {" "}y{" "}
                            <Link to="/terms" className="text-slate-400 hover:text-white transition-colors underline decoration-slate-600 underline-offset-2">Términos de Servicio</Link>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side (Illustration) */}
            <div className="hidden lg:flex w-1/2 bg-[#020617] items-center justify-center p-12 relative overflow-hidden border-l border-white/5">
                {/* Abstract elements */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="w-24 h-24 mx-auto bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-900/20">
                        <ShieldCheck className="w-12 h-12 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">La IA legal de confianza</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Accede a tus informes, revisa tus análisis anteriores y continúa protegiendo tus operaciones inmobiliarias con total seguridad.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
