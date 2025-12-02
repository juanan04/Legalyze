import DashboardLayout from "../../components/layout/DashboardLayout";

const DashboardPage = () => {
    // Más adelante sacaremos el nombre del usuario real
    const userName = "Carlos";

    return (
        <DashboardLayout>
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Hola, {userName}
                    </h1>
                    <p className="mt-1 text-slate-400">¿Qué quieres hacer hoy?</p>
                </div>

                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    {/* Notificaciones */}
                    <button
                        type="button"
                        className="relative text-slate-400 hover:text-slate-100 transition-colors"
                    >
                        <span className="text-2xl">🔔</span>
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0f172a]" />
                    </button>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                        <span className="font-bold text-orange-700">
                            {userName.charAt(0)}
                        </span>
                    </div>
                </div>
            </header>

            {/* Tarjetas principales */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Analizar contrato */}
                <div className="group relative p-8 rounded-2xl overflow-hidden bg-linear-gradient-to-br from-indigo-400 to-purple-500 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 text-white">
                        <div className="w-14 h-14 mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="text-3xl">📄</span>
                        </div>
                        <h2 className="text-2xl font-bold mb-1">Analizar contrato</h2>
                        <p className="opacity-80">Sube y revisa tus documentos.</p>
                    </div>
                </div>

                {/* Generar contrato */}
                <div className="group relative p-8 rounded-2xl overflow-hidden bg-linear-gradient-to-br from-emerald-400 to-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10 text-white">
                        <div className="w-14 h-14 mb-4 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="text-3xl">➕</span>
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

                {/* Empty state */}
                <div className="bg-slate-900/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-4xl text-slate-500">📦</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                        No hay actividad reciente
                    </h3>
                    <p className="text-slate-400 max-w-md">
                        Comienza por analizar o generar tu primer contrato para ver tu
                        historial aquí.
                    </p>
                </div>

                {/* Links rápidos */}
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <span className="text-slate-300">⏱️</span>
                            </div>
                            <p className="font-semibold text-white">Mi historial</p>
                        </div>
                        <span className="text-slate-500">›</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                                <span className="text-slate-300">👤</span>
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
