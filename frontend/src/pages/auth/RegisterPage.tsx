import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Aquí luego llamaremos a /api/auth/register
        console.log({ name, email, password, confirmPassword });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md mx-auto">
                {/* Icono + título */}
                <div className="flex flex-col items-center justify-center mb-8 text-center">
                    <div className="bg-[#3b82f6] p-4 rounded-xl mb-6 shadow-lg">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">✎</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-extrabold text-white">
                        Crea tu cuenta
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Analiza, genera y gestiona tus documentos legales.
                    </p>
                </div>

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
                                className="w-full flex justify-center py-3 px-4 rounded-md text-base font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] focus:ring-offset-[#0f172a] transition-colors duration-150"
                            >
                                Registrarse
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
