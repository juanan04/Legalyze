import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const LandingPage = () => {

    const scrollToDemo = () => {
        const demoSection = document.getElementById('demo-section');
        if (demoSection) {
            demoSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-blue-500/30 relative">
            {/* Nav */}
            <nav className="absolute top-0 right-0 p-6 z-10">
                <Link
                    to="/login"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white transition-all duration-200 backdrop-blur-sm text-sm font-medium group"
                >
                    <span className="opacity-70 group-hover:opacity-100">🔐</span>
                    Ya tengo cuenta
                </Link>
            </nav>
            <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col items-center">

                {/* 1) HERO */}
                <section className="text-center max-w-3xl mx-auto mb-20">
                    <div className="flex justify-center mb-8">
                        <img src={logo} alt="Legalyze Logo" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-2xl shadow-blue-500/20" />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                        Analiza tu contrato en segundos. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            Detecta riesgos antes de firmar.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        1 análisis gratis. Sin tarjeta. Luego paga solo si lo necesitas.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Link
                            to="/register"
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/25 ring-offset-2 ring-offset-[#0f172a] focus:ring-2 focus:ring-blue-500"
                        >
                            Analizar contrato gratis
                        </Link>
                        <button
                            onClick={scrollToDemo}
                            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-4 px-8 rounded-xl transition-all duration-200 border border-slate-700 cursor-pointer"
                        >
                            Ver ejemplo de análisis
                        </button>
                    </div>
                </section>

                {/* 1.5) DEMO */}
                <section id="demo-section" className="w-full mb-20 text-center scroll-mt-24">
                    <div className="mx-auto max-w-4xl aspect-video bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-blue-900/20 group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 to-transparent"></div>
                        {/* Placeholder para futuro GIF */}
                        <div className="flex flex-col items-center gap-3 z-10 p-6">
                            <span className="text-4xl md:text-5xl opacity-50">🎬</span>
                            <p className="text-slate-400 font-medium animate-pulse">
                                Video de demostración próximamente...
                            </p>
                        </div>

                        {/* <img src="/demo.gif" alt="Demo Legalyze" className="absolute inset-0 w-full h-full object-cover" /> */}
                    </div>
                </section>

                {/* 2) CÓMO FUNCIONA */}
                <section className="w-full mb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: "📄", title: "Sube tu contrato", desc: "Soporta PDF o texto directo." },
                            { icon: "⚡", title: "IA analiza riesgos", desc: "Detectamos cláusulas abusivas." },
                            { icon: "✅", title: "Decide con claridad", desc: "Firma seguro o negocia mejor." }
                        ].map((step, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl text-center hover:border-blue-500/30 transition-colors">
                                <div className="text-4xl mb-4">{step.icon}</div>
                                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                                <p className="text-slate-400">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3) PRUEBA + CRÉDITOS */}
                <section className="w-full max-w-lg mx-auto mb-20 p-8 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-3xl border border-slate-700 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>

                    <h2 className="text-2xl font-bold text-white mb-6">Empieza gratis hoy</h2>
                    <ul className="text-left space-y-3 text-slate-300 mb-8 max-w-xs mx-auto">
                        <li className="flex items-center gap-3">
                            <span className="text-blue-400">✔</span> 1 análisis gratis por usuario
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-blue-400">✔</span> Sin tarjeta de crédito
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-blue-400">✔</span> Resultados claros y explicados
                        </li>
                    </ul>
                    <p className="text-sm text-slate-500 font-medium bg-slate-950/30 py-2 px-4 rounded-full inline-block">
                        Análisis adicionales desde 0,50€ (1 crédito)
                    </p>
                </section>

                {/* 4) PARA QUIÉN ES */}
                <section className="w-full mb-20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">Ideal para...</h2>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["🏠 Inquilinos", "🏡 Compradores de vivienda", "🚗 Vehículos", "💼 Autónomos", "🛡️ Cualquiera que no quiera firmar a ciegas"].map((tag, i) => (
                            <span key={i} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700">
                                {tag}
                            </span>
                        ))}
                    </div>
                </section>

                {/* 5) CONFIANZA */}
                <section className="w-full border-t border-slate-800 pt-10 pb-4">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-slate-500 text-sm">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            No almacenamos tus documentos
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            Pagos seguros con Stripe
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Datos cifrados
                        </span>
                    </div>
                </section>

            </main>
        </div>
    );
};

export default LandingPage;
