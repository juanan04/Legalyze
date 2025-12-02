import DashboardLayout from "../../components/layout/DashboardLayout";

const ProfilePage = () => {
    // Luego esto vendrá del backend / contexto de auth
    const user = {
        name: "Ana",
        lastName: "Rodríguez",
        email: "ana.rodriguez@email.com",
        memberSince: "24 de Mayo, 2023",
        planName: "Legalyze Pro",
        planRenewal: "24 de Junio, 2024",
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Perfil</h1>
                    <button
                        type="button"
                        className="bg-[#2563EB] text-white text-sm font-semibold py-2 px-5 rounded-lg hover:bg-[#1D4ED8] transition-colors"
                    >
                        Guardar
                    </button>
                </header>

                {/* Card principal con avatar */}
                <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl mb-8 flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800 flex items-center justify-center">
                            {/* Puedes cambiar esto por una imagen real cuando la tengas */}
                            <span className="text-3xl font-semibold">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="absolute bottom-0 right-0 bg-[#2563EB] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm hover:bg-[#1D4ED8] transition-colors"
                        >
                            ✎
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold text-white">
                        {user.name} {user.lastName}
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Miembro desde {user.memberSince}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Información personal */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">
                            Información personal
                        </h3>
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Nombre
                                    </label>
                                    <p className="text-sm text-slate-100">{user.name}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Apellido
                                    </label>
                                    <p className="text-sm text-slate-100">{user.lastName}</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-800 pt-4">
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Correo electrónico
                                </label>
                                <p className="text-sm text-slate-100">{user.email}</p>
                            </div>
                        </div>
                    </section>

                    {/* Plan actual */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">Mi plan</h3>
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h4 className="text-lg font-semibold text-white">
                                    {user.planName}
                                </h4>
                                <p className="text-sm text-slate-400">
                                    Se renueva el {user.planRenewal}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="bg-[#2563EB] text-white text-sm font-semibold py-2 px-5 rounded-lg hover:bg-[#1D4ED8] transition-colors"
                            >
                                Gestionar plan
                            </button>
                        </div>
                    </section>

                    {/* Legal y soporte */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">
                            Legal y soporte
                        </h3>
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                            <ul className="divide-y divide-slate-800">
                                <li>
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-800/70 transition-colors"
                                    >
                                        <span>Términos de servicio</span>
                                        <span className="text-slate-500">›</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-800/70 transition-colors"
                                    >
                                        <span>Política de privacidad</span>
                                        <span className="text-slate-500">›</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center px-4 py-3 text-sm hover:bg-slate-800/70 transition-colors"
                                    >
                                        <span>Ayuda y soporte</span>
                                        <span className="text-slate-500">›</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Cuenta */}
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-white">Cuenta</h3>
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                            <button
                                type="button"
                                className="w-full sm:w-auto text-red-500 font-semibold py-2 px-5 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
