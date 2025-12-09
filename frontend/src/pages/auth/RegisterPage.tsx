import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { api } from "../../lib/api";
import logo from "../../assets/logo.png";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

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
                password,
            });
            const token = res.data.token;
            if (token) {
                // El backend devuelve id, name, email en la respuesta
                const user = {
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email
                };
                login(token, user);
            } else {
                // Fallback si no viene token, aunque el backend ya lo manda
                navigate("/login");
            }
        } catch (err) {
            if (err && typeof err === 'object' && 'response' in err) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const axiosError = err as any;
                setError(
                    axiosError.response?.data?.message ??
                    "No se pudo completar el registro. Inténtalo de nuevo más tarde."
                );
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error inesperado");
            }
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md mx-auto">
                {/* Icono + título */}
                <div className="flex flex-col items-center justify-center mb-8 text-center">
                    <img src={logo} alt="Legalyze Logo" className="w-20 h-20 rounded-xl mb-6" />

                    <h1 className="text-3xl font-extrabold text-white">
                        Crea tu cuenta
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Analiza, genera y gestiona tus documentos legales.
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Card */}
                <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-8 shadow-lg">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Nombre Completo
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full px-4 py-3 rounded-md bg-[#020617] border border-[#1f2937] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

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
                                    placeholder="ejemplo@correo.com"
                                    className="w-full px-4 py-3 rounded-md bg-[#020617] border border-[#1f2937] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-md bg-[#020617] border border-[#1f2937] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-300"
                            >
                                Confirmar Contraseña
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-md bg-[#020617] border border-[#1f2937] text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Botón */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 rounded-md text-base font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] focus:ring-offset-[#0f172a] transition-colors duration-150"
                            >
                                {loading ? "Registrando..." : "Registrarse"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        ¿Ya tienes una cuenta?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-[#3b82f6] hover:underline"
                        >
                            Iniciar Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
