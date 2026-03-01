import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Scale } from "lucide-react";

import { api } from "../../lib/api";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [agencyName, setAgencyName] = useState("");
    const [jobPosition, setJobPosition] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/api/auth/register", {
                name,
                email,
                agencyName,
                jobPosition,
                password,
            });
            const user = {
                id: res.data.id,
                name: res.data.name,
                email: res.data.email,
                credits: 0,
                freeTrialsRemaining: res.data.freeTrialsRemaining ?? 3,
                freeAnalysisUsed: false,
                emailVerified: false
            };
            login("", user, false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado al registrarse.");
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
                            Crea tu cuenta
                        </h1>
                        <p className="text-slate-400 text-sm">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Iniciar sesión
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Flujo de 2 columnas para el nombre (estético) - o dejarlo normal */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                                Nombre completo
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Correo electrónico (Corporativo recomendado)
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="agencyName" className="block text-sm font-medium text-slate-300 mb-2">
                                Nombre de tu Inmobiliaria/Agencia
                            </label>
                            <input
                                id="agencyName"
                                type="text"
                                required
                                value={agencyName}
                                onChange={(e) => setAgencyName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="jobPosition" className="block text-sm font-medium text-slate-300 mb-2">
                                ¿Cuál es tu cargo?
                            </label>
                            <select
                                id="jobPosition"
                                required
                                value={jobPosition}
                                onChange={(e) => setJobPosition(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-colors"
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="Gerente/Director">Gerente/Director</option>
                                <option value="Asesor Inmobiliario">Asesor Inmobiliario</option>
                                <option value="Administración/Legal">Administración/Legal</option>
                                <option value="Inversor Particular">Inversor Particular</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
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

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 mt-6 rounded-xl text-sm font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-400 focus:ring-offset-[#0f172a] shadow-[0_0_15px_rgba(163,230,53,0.5)] transition-all duration-200 cursor-pointer"
                        >
                            {loading ? "Preparando entorno..." : "Comenzar Evaluación Profesional"}
                        </button>
                    </form>

                    <div className="mt-8">
                        <p className="text-xs text-center text-slate-500 leading-relaxed">
                            Al crear una cuenta, aceptas nuestra{" "}
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
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 max-w-lg text-center">
                    <div className="w-24 h-24 mx-auto bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-cyan-900/20">
                        <Scale className="w-12 h-12 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">La tranquilidad de elegir bien</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Únete con de forma gratuita y empieza a comprobar contratos al instante asegurando tus decisiones más difíciles.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
