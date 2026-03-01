import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, FileText, CheckCircle, AlertTriangle, Scale, ArrowRight, ShieldCheck, FileSearch, HelpCircle, Sparkles } from "lucide-react";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const LandingPage = () => {

    return (
        <div className="w-full bg-slate-50 min-h-screen font-sans selection:bg-indigo-500/30">

            {/* 1) HERO SECTION (Dark Mode) */}
            <section className="relative w-full bg-[#020617] text-white pt-24 pb-32 overflow-hidden border-b border-white/5">
                {/* Abstract Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 items-center">

                    {/* Hero Text */}
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={{
                            initial: { opacity: 0, x: -30 },
                            animate: { opacity: 1, x: 0, transition: { staggerChildren: 0.2, duration: 0.5 } }
                        }}
                        className="max-w-2xl"
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                            Actualizado normativa LAU 2024-2026
                        </motion.div>

                        <motion.h1 variants={fadeIn} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                            Blinda tu inmobiliaria: <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                Audita tus contratos
                            </span><br />
                            en 30 segundos.
                        </motion.h1>

                        <motion.p variants={fadeIn} className="text-slate-400 text-lg sm:text-xl mb-8 leading-relaxed">
                            Evita multas, asegura tus honorarios y duerme tranquilo. El primer auditor de contratos con IA entrenado específicamente para la normativa española de Vivienda.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/register"
                                className="inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.6)] ring-offset-2 ring-offset-[#020617] focus:ring-2 focus:ring-indigo-500"
                            >
                                Comenzar Evaluación Profesional
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a href="#how-it-works" className="inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 px-8 rounded-xl transition-colors">
                                Ver cómo funciona
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Hero Visual Mockup 3D */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                        style={{ perspective: "1000px" }}
                        className="relative hidden lg:block h-[500px]"
                    >
                        {/* Fake Document */}
                        <div className="absolute top-10 right-10 w-[380px] h-[480px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 opacity-60 backdrop-blur-sm -rotate-2">
                            <div className="w-3/4 h-4 bg-slate-800 rounded mb-6"></div>
                            <div className="space-y-3">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className={`h-2 bg-slate-800 rounded ${i % 3 === 0 ? 'w-full' : 'w-5/6'}`}></div>
                                ))}
                            </div>
                            <div className="w-1/2 h-4 bg-slate-800 rounded mt-8 mb-6"></div>
                            <div className="space-y-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className={`h-2 bg-slate-800 rounded ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Metric 1 */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="absolute top-0 right-48 flex items-center gap-4 bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl z-20"
                        >
                            <div className="relative w-16 h-16">
                                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                    <path className="text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="text-yellow-500" strokeWidth="3" strokeDasharray="64, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">64%</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Salud Legal</p>
                                <p className="text-sm font-bold text-white">Requiere Revisión</p>
                            </div>
                        </motion.div>

                        {/* Floating Metric 2 */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.1, duration: 0.5 }}
                            className="absolute bottom-16 right-0 bg-slate-900 border border-red-500/30 p-5 rounded-2xl shadow-2xl z-30 max-w-sm backdrop-blur-xl"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-red-500/20 text-red-500 rounded-lg">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400">CRÍTICO</span>
                                        <span className="text-xs text-slate-400">Cláusula 4</span>
                                    </div>
                                    <p className="text-sm font-semibold text-white mb-2">Riesgo de Fraude de Ley detectado</p>
                                    <p className="text-xs text-slate-400">Este contrato de habitación podría ser considerado vivienda permanente encubierta. Honorarios agencia en riesgo.</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 2) SOCIAL PROOF */}
            {/* <section className="border-b border-slate-200 bg-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Agencias que ya duermen tranquilas</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale text-slate-800"> */}
            {/* Placeholder Logos */}
            {/* <div className="text-xl font-extrabold flex items-center gap-2"><Building className="w-6 h-6 text-slate-800" /> URBANA</div>
                        <div className="text-xl font-extrabold flex items-center gap-2"><div className="w-6 h-6 bg-slate-800 rounded-sm"></div> INMOBAL</div>
                        <div className="text-xl font-extrabold flex items-center gap-2"><Shield className="w-6 h-6 text-slate-800" /> GESTORA NORTE</div>
                        <div className="text-xl font-black tracking-tighter">ESTATE<span className="text-slate-500">PRO</span></div>
                    </div>
                </div>
            </section> */}

            {/* 3) PROBLEMA (AGITACIÓN) */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn}>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                            Un error en una sola palabra puede convertir un contrato de 11 meses en <span className="text-red-600">uno de 5 años</span>.
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                            La nueva Ley de Vivienda castiga severamente el Fraude de Ley. Firmar plantillas de internet o contratos desactualizados pone en riesgo directo las comisiones de la agencia y el patrimonio del propietario.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 4) BENTO GRID (FEATURES) */}
            <section className="py-24 bg-white" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">La seguridad de un bufete, a un clic</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Nuestro motor de IA está constantemente actualizado con las últimas sentencias y variaciones de la Ley de Arrendamientos Urbanos (LAU) y el Código Civil.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 auto-rows-[minmax(250px,_auto)]">

                        {/* Box 1 (Span 2 cols on md) */}
                        <motion.div
                            initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn}
                            className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                            <div className="absolute -right-10 -top-10 text-indigo-100/50">
                                <SearchIcon large />
                            </div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-indigo-600/20">
                                    <FileSearch className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Detección de Fraude de Ley</h3>
                                <p className="text-slate-600 max-w-md">Analizamos exhaustivamente los contratos de Temporada y Habitaciones verificando si cumplen los requisitos reales para no ser clasificados como "Vivienda Permanente" encubierta.</p>
                            </div>
                        </motion.div>

                        {/* Box 2 */}
                        <motion.div
                            initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn}
                            className="bg-gradient-to-br from-cyan-50 to-white border border-cyan-100 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-cyan-600 text-white flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-cyan-600/20">
                                <Scale className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Control de Honorarios (Art. 20.1)</h3>
                            <p className="text-slate-600 text-sm">Detecta si la cláusula de cobro de honorarios de la agencia es nula de pleno derecho según la última reforma de la LAU.</p>
                        </motion.div>

                        {/* Box 3 */}
                        <motion.div
                            initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn}
                            className="bg-gradient-to-br from-slate-100 to-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-slate-800 text-white flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-slate-800/20">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Re-redacción Automática</h3>
                            <p className="text-slate-600 text-sm">No solo te decimos qué está mal. La IA te proporciona instantáneamente la redacción alternativa segura para blindar la cláusula nula.</p>
                        </motion.div>

                        {/* Box 4 (Span 2 cols on md) */}
                        <motion.div
                            initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn}
                            className="md:col-span-2 bg-[#020617] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute right-0 bottom-0 opacity-10">
                                <ShieldCheck className="w-48 h-48" />
                            </div>
                            <div className="relative z-10 flex flex-col justify-center h-full">
                                <h3 className="text-2xl font-bold mb-3">Reporte PDF para tus clientes</h3>
                                <p className="text-slate-400 mb-6 max-w-md">Descarga un informe detallado con tu marca para entregar al propietario o inquilino, demostrando el rigor técnico de tus servicios inmobiliarios.</p>
                                <Link to="/register" className="inline-flex items-center text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                                    Pruébalo ahora en un documento real <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* 5) CÓMO FUNCIONA */}
            <section className="py-24 bg-slate-50" id="how-it-works">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
                        <p className="text-slate-600">En tres simples pasos, sin instalaciones complicadas.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connector line on desktop */}
                        <div className="hidden md:block absolute top-12 left-24 right-24 h-0.5 bg-slate-200 z-0"></div>

                        {[
                            { step: "1", icon: <FileText className="w-6 h-6" />, title: "Sube tu PDF o DOCX", desc: "Arrastra el contrato que te han pasado. No guardamos log de tus archivos para garantizar la RGPD." },
                            { step: "2", icon: <Zap className="w-6 h-6" />, title: "Análisis IA Inmobiliaria", desc: "El algoritmo lee, clasifica el régimen y cruza las cláusulas con el Código Civil y la LAU." },
                            { step: "3", icon: <ShieldCheck className="w-6 h-6" />, title: "Reporte y Blindaje", desc: "Obtén la nota de salud legal, el veredicto y las redacciones sugeridas para corregirlo." }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn}
                                className="relative z-10 flex flex-col items-center text-center"
                            >
                                <div className="w-24 h-24 mb-6 rounded-full bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center text-indigo-600 relative">
                                    {item.icon}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center border-2 border-white">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6) PRICING */}
            <section className="py-24 bg-slate-950 relative border-t border-slate-900" id="pricing">
                {/* Abstract Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 font-['Plus_Jakarta_Sans',sans-serif]">
                    <span className="text-indigo-500 font-semibold tracking-wider uppercase text-sm mb-3 block">
                        PRECIOS CLAROS
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Planes para tu inmobiliaria</h2>
                    <p className="text-slate-400 mb-16 text-lg md:text-xl max-w-3xl mx-auto">
                        Únete a cientos de agencias que ya protegen sus operaciones con Legalyze. Date de baja cuando quieras.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {/* Free Tier */}
                        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-left flex flex-col hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                            <p className="text-slate-400 mb-6 text-sm h-10">Para probar la plataforma</p>
                            <div className="flex items-end gap-1 mt-6 mb-8">
                                <div className="text-5xl font-extrabold text-white">0€</div>
                                <span className="text-slate-500 mb-1">/ único</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 mt-4">
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-slate-500" /></div>
                                    <span className="text-sm font-medium">3 Evaluaciones de cortesía</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-slate-500" /></div>
                                    <span className="text-sm font-medium">Resultados básicos</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-slate-500" /></div>
                                    <span className="text-sm font-medium">Sin tarjeta de crédito</span>
                                </li>
                            </ul>
                            <Link to="/register" className="block w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 rounded-xl transition-all">
                                Evaluación Profesional
                            </Link>
                        </div>

                        {/* Starter Tier */}
                        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl text-left flex flex-col hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-300">
                            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                            <p className="text-slate-400 mb-6 text-sm h-10">Para agentes inmobiliarios independientes</p>
                            <div className="flex items-end gap-1 mt-6 mb-8">
                                <div className="text-5xl font-extrabold text-white">59€</div>
                                <span className="text-slate-500 mb-1">/ mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 mt-4">
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-slate-500" /></div>
                                    <span className="text-sm font-medium">30 Créditos al mes</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-slate-500" /></div>
                                    <span className="text-sm font-medium">Renovación mensual automática</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-slate-500" /></div>
                                    <span className="text-sm font-medium">Soporte por email</span>
                                </li>
                            </ul>
                            <Link to="/register" className="block w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 rounded-xl transition-all">
                                Suscribirse a Starter
                            </Link>
                        </div>

                        {/* Pro Tier (Recommended) */}
                        <div className="bg-slate-900 border border-indigo-500 shadow-2xl shadow-indigo-500/20 p-8 rounded-3xl text-left relative transform md:-translate-y-4 flex flex-col transition-all duration-300">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-indigo-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1 shadow-lg">
                                <Sparkles className="w-4 h-4" /> Más Popular
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                            <p className="text-slate-400 mb-6 text-sm h-10">Para agencias inmobiliarias establecidas</p>
                            <div className="flex items-end gap-1 mt-6 mb-8">
                                <div className="text-5xl font-extrabold text-white">129€</div>
                                <span className="text-slate-500 mb-1">/ mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1 mt-4">
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-indigo-400" /></div>
                                    <span className="text-sm font-medium">100 Créditos al mes</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-indigo-400" /></div>
                                    <span className="text-sm font-medium">Renovación mensual automática</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-300">
                                    <div className="shrink-0 mt-0.5"><CheckCircle className="w-5 h-5 text-indigo-400" /></div>
                                    <span className="text-sm font-medium">Soporte prioritario 24/7</span>
                                </li>
                            </ul>
                            <Link to="/register" className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/25">
                                Suscribirse a Pro
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7) FAQ */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Preguntas Frecuentes</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">¿Es seguro subir mis contratos? ¿Qué pasa con la RGPD?</h3>
                            <p className="text-slate-600">Totalmente seguro. No almacenamos los PDFs ni el texto de tus contratos una vez finalizado el análisis. El procesamiento se realiza de forma efímera para generar el resultado y luego se descarta. Solo se guarda el reporte final en tu cuenta.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">¿Sustituye a un abogado?</h3>
                            <p className="text-slate-600">Legalyze es una herramienta preventiva, equivalente a un "Pre-scoring". Detecta automáticamente anomalías legales evidentes y fraudes normativos para evitar problemas, pero en caso de litigio, un abogado colegiado siempre será quien deba representarte.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">¿Sirve para contratos fuera de España?</h3>
                            <p className="text-slate-600">No. Nuestra IA ha sido rigurosamente instruida única y exclusivamente con el Código Civil Español, la Ley de Arrendamientos Urbanos (LAU) y la Ley de Vivienda 12/2023 de España para evitar alucinaciones.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8) CTA FOOTER */}
            <section className="py-20 bg-[#020617] text-center border-t border-white/10">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">No dejes tus honorarios al azar</h2>
                    <Link
                        to="/register"
                        className="inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-full transition-all duration-200 shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)] hover:scale-105"
                    >
                        Comenzar Evaluación Profesional
                    </Link>
                </div>
            </section>

        </div>
    );
};

// Helper Icon for decoration
const SearchIcon = ({ large = false }) => (
    <svg className={large ? "w-64 h-64" : "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export default LandingPage;
