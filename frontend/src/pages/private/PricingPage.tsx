import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { api } from "../../lib/api";
import { Check, CreditCard, Shield, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PricingPage = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handlePurchase = async (packId: string) => {
        setIsLoading(packId);
        try {
            const response = await api.post<{ url: string }>("/api/payments/checkout", { packId });
            if (response.data.url) {
                window.location.assign(response.data.url);
            }
        } catch (error: any) {
            console.error("Purchase error:", error);
            const msg = error.response?.data?.error || error.response?.data?.message || "Error al iniciar el pago.";
            alert(msg);
            setIsLoading(null);
        }
    };

    const isSubscribed = user?.subscriptionPlan === "STARTER" || user?.subscriptionPlan === "PRO";

    const plans = [
        {
            id: "free",
            name: "Free",
            credits: "3",
            price: "0",
            period: "único",
            description: "Para probar la plataforma",
            features: ["3 Evaluaciones de cortesía", "Resultados básicos", "Sin tarjeta de crédito"],
            buttonText: user?.subscriptionPlan === "FREE" ? "Plan Actual" : "Evaluación Profesional",
            action: null,
            recommended: false,
            current: user?.subscriptionPlan === "FREE"
        },
        {
            id: "sub_starter",
            name: "Starter",
            credits: "30",
            price: "59",
            period: "/ mes",
            description: "Para agentes inmobiliarios independientes",
            features: ["30 Créditos al mes", "Renovación mensual automática", "Soporte por email"],
            buttonText: user?.subscriptionPlan === "STARTER" ? "Plan Actual" : "Suscribirse a Starter",
            action: "sub_starter",
            recommended: false,
            current: user?.subscriptionPlan === "STARTER"
        },
        {
            id: "sub_pro",
            name: "Pro",
            credits: "100",
            price: "129",
            period: "/ mes",
            description: "Para agencias inmobiliarias establecidas",
            features: ["100 Créditos al mes", "Renovación mensual automática", "Soporte prioritario 24/7"],
            buttonText: user?.subscriptionPlan === "PRO" ? "Plan Actual" : "Suscribirse a Pro",
            action: "sub_pro",
            recommended: true,
            current: user?.subscriptionPlan === "PRO"
        }
    ];

    return (
        <DashboardLayout>
            <div className="bg-slate-950 min-h-full py-12 px-4 font-['Plus_Jakarta_Sans',sans-serif]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-indigo-500 font-semibold tracking-wider uppercase text-sm mb-3 block">
                            PRECIOS CLAROS
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                            Invierte en seguridad legal para tu agencia
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto">
                            Únete a cientos de inmobiliarias que ya protegen sus operaciones con Legalyze. Elige el plan que mejor se adapte a tu volumen.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-3xl p-8 border flex flex-col transition-all duration-300 ${plan.recommended
                                    ? "bg-slate-900 border-indigo-500 shadow-2xl shadow-indigo-500/20 transform md:-translate-y-4"
                                    : "bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-900/60"
                                    }`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase flex items-center gap-1 shadow-lg">
                                        <Sparkles className="w-4 h-4" /> Más Popular
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm h-10">{plan.description}</p>
                                    <div className="flex items-end gap-1 mt-6">
                                        <span className="text-5xl font-extrabold text-white">{plan.price}€</span>
                                        <span className="text-slate-500 mb-1">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1 mt-4">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3 text-slate-300">
                                            <div className="shrink-0 mt-0.5">
                                                <Check className={`w-5 h-5 ${plan.recommended ? "text-indigo-400" : "text-slate-500"}`} />
                                            </div>
                                            <span className="text-sm font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => plan.action && !plan.current && handlePurchase(plan.action)}
                                    disabled={!plan.action || plan.current || !!isLoading}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${plan.current
                                        ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
                                        : plan.recommended
                                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 cursor-pointer"
                                            : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer"
                                        }`}
                                >
                                    {plan.action === null ? (
                                        plan.current ? <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Tu Plan Actual</span> : "Evaluación Profesional"
                                    ) : isLoading === plan.action ? (
                                        "Redirigiendo..."
                                    ) : plan.current ? (
                                        <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Tu Plan Actual</span>
                                    ) : (
                                        plan.buttonText
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Top Ups */}
                    {isSubscribed && (
                        <div className="mt-20 max-w-3xl mx-auto bg-slate-900/50 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center md:flex md:text-left items-center justify-between shadow-xl">
                            <div className="md:pr-8 mb-6 md:mb-0">
                                <h3 className="text-2xl font-bold text-white mb-2">¿Necesitas más créditos este mes?</h3>
                                <p className="text-slate-400 text-sm md:text-base">
                                    Añade un paquete de 10 créditos extra por solo 20€. Se sumarán inmediatamente a tu cuenta. Solo disponible para usuarios Starter o Pro.
                                </p>
                            </div>
                            <button
                                onClick={() => handlePurchase("pack_10")}
                                disabled={!!isLoading}
                                className="shrink-0 bg-white text-slate-900 hover:bg-slate-100 font-bold py-4 px-8 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 m-auto md:m-0 cursor-pointer"
                            >
                                {isLoading === "pack_10" ? "Procesando..." : <><CreditCard className="w-5 h-5" /> Comprar 10 Créditos</>}
                            </button>
                        </div>
                    )}

                    {!isSubscribed && (
                        <div className="mt-20 max-w-2xl mx-auto text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-6">
                                <Shield className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Pagos Seguros</h3>
                            <p className="text-slate-400 text-sm">
                                Todas las transacciones son procesadas y aseguradas mediante Stripe. No almacenamos datos de tus tarjetas en nuestros servidores.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PricingPage;
