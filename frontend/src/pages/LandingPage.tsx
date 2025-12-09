import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center px-4 md:px-8">
            <main className="w-full max-w-xl text-center">
                {/* Icono superior */}
                <div className="flex justify-center mb-8">
                    <img src={logo} alt="Legalyze Logo" className="w-24 h-24 rounded-2xl shadow-lg shadow-blue-500/20" />
                </div>

                {/* Título + subtítulo */}
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                    Tus contratos, claros y seguros.
                </h1>
                <p className="text-slate-400 text-lg mb-10">
                    Analiza, genera y gestiona tus documentos legales con facilidad.
                </p>

                {/* Cards de features */}
                <div className="space-y-4 mb-10">
                    <div className="flex items-center space-x-4 p-4 border border-slate-700 bg-slate-900/60 rounded-xl">
                        <div className="bg-[#2563EB]/10 text-[#2563EB] p-2 rounded-full">
                            <span className="text-lg">🔍</span>
                        </div>
                        <span className="text-slate-100 text-sm md:text-base">
                            Analiza al instante
                        </span>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-slate-700 bg-slate-900/60 rounded-xl">
                        <div className="bg-[#2563EB]/10 text-[#2563EB] p-2 rounded-full">
                            <span className="text-lg">📄</span>
                        </div>
                        <span className="text-slate-100 text-sm md:text-base">
                            Crea contratos personalizados
                        </span>
                    </div>

                    <div className="flex items-center space-x-4 p-4 border border-slate-700 bg-slate-900/60 rounded-xl">
                        <div className="bg-[#2563EB]/10 text-[#2563EB] p-2 rounded-full">
                            <span className="text-lg">🔒</span>
                        </div>
                        <span className="text-slate-100 text-sm md:text-base">
                            100% privado y seguro
                        </span>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col space-y-4">
                    <Link
                        to="/register"
                        className="bg-[#2563EB] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#1D4ED8] transition-colors duration-200 w-full"
                    >
                        Registrarse
                    </Link>

                    <Link
                        to="/login"
                        className="text-[#2563EB] font-semibold py-3 px-6 rounded-lg hover:bg-[#1D4ED8]/10 transition-colors duration-200 w-full"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
