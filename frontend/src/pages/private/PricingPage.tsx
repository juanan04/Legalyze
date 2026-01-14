import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { api } from "../../lib/api";
import { Check, CreditCard, Zap } from "lucide-react";

const PricingPage = () => {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handlePurchase = async (packId: string) => {
        setIsLoading(packId);
        try {
            const response = await api.post<{ url: string }>("/api/payments/checkout", { packId });
            if (response.data.url) {
                window.location.assign(response.data.url);
            }
        } catch (error) {
            console.error("Purchase error:", error);
            alert("Error al iniciar el pago. Inténtalo de nuevo.");
            setIsLoading(null);
        }
    };

    const packs = [
        {
            id: "pack_10",
            name: "Pack Básico",
            credits: 10,
            price: 5,
            features: ["10 Análisis de contratos", "Generación básica", "Soporte por email"],
            recommended: false
        },
        {
            id: "pack_50",
            name: "Pack Pro",
            credits: 50,
            price: 20,
            features: ["50 Análisis de contratos", "Generación prioritaria", "Soporte prioritario", "Ahorras 20%"],
            recommended: true
        }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Invierte en tu tranquilidad legal
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Compra créditos para analizar y generar contratos. Sin suscripciones mensuales, paga solo por lo que usas.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {packs.map((pack) => (
                        <div
                            key={pack.id}
                            className={`relative rounded-2xl p-8 border ${pack.recommended
                                ? "bg-slate-900/80 border-blue-500 shadow-2xl shadow-blue-500/20"
                                : "bg-slate-900/40 border-slate-700"
                                } flex flex-col`}
                        >
                            {pack.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <Zap className="w-4 h-4" /> Recomendado
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white mb-2">{pack.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{pack.price}€</span>
                                    <span className="text-slate-400">/ único</span>
                                </div>
                                <p className="text-blue-400 font-medium mt-2">{pack.credits} Créditos</p>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {pack.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3 text-slate-300">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-blue-400" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handlePurchase(pack.id)}
                                disabled={!!isLoading}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${pack.recommended
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-600/30"
                                    : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                                    } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                {isLoading === pack.id ? (
                                    "Procesando..."
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Comprar ahora
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-slate-500 text-sm">
                        Pagos seguros procesados por Stripe. No almacenamos tus datos de pago.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PricingPage;
