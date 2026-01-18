import type { FormEvent } from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await api.post("/api/auth/login", { email, password, rememberMe });

            // 1. Extraemos los datos
            const token: string = res.data.token;
            const user = res.data.user;

            // --- AÑADE ESTO (Línea Crítica) ---
            // Guardamos el token para que api.ts lo encuentre
            if (token) {
                localStorage.setItem("token", token);
            } else {
                console.error("El backend no devolvió un token:", res.data);
                throw new Error("Error de autenticación: No se recibió token.");
            }
            // ----------------------------------

            // 2. Actualizamos el estado global de React
            login(token, user, rememberMe);

            // La navegación la maneja el useEffect o el AuthContext, 
            // pero si no redirige, puedes descomentar esto:
            // navigate("/dashboard"); 

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
            }
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md mx-auto">
                {/* Logo + textos */}
                <div className="flex flex-col items-center text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-gray-400">
                        Inicia sesión para acceder a tu cuenta.
                    </p>
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Card */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-8 shadow-lg">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Correo Electrónico
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full px-4 py-3 rounded-md bg-[#020617] border border-[#1f2937] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Contraseña
                                </label>
                            </div>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full px-4 py-3 rounded-md bg-[#020617] border border-[#1f2937] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-[#3b82f6] focus:ring-[#3b82f6] bg-[#020617] border-[#1f2937]"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                Recordar usuario
                            </label>
                        </div>

                        {/* Botón */}
                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 rounded-md text-base font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] focus:ring-offset-[#0f172a] transition-colors duration-150 cursor-pointer"
                            >
                                Iniciar Sesión
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        ¿No tienes una cuenta?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-[#3b82f6] hover:underline"
                        >
                            Regístrate
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
