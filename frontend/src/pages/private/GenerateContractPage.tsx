// src/pages/GenerateContractPage.tsx
import { useState } from "react";
import type { FC } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

type Step = "info" | "clauses" | "preview";

const GenerateContractPage: FC = () => {
    const [step, setStep] = useState<Step>("info");

    const renderTabs = () => (
        <div className="border-b border-slate-700 mb-8">
            <nav aria-label="Pasos de generación" className="-mb-px flex gap-8 text-sm">
                <button
                    type="button"
                    onClick={() => setStep("info")}
                    className={`border-b-2 pb-3 font-medium transition-colors ${step === "info"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                >
                    Información
                </button>
                <button
                    type="button"
                    onClick={() => setStep("clauses")}
                    className={`border-b-2 pb-3 font-medium transition-colors ${step === "clauses"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                >
                    Cláusulas
                </button>
                <button
                    type="button"
                    onClick={() => setStep("preview")}
                    className={`border-b-2 pb-3 font-medium transition-colors ${step === "preview"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                        }`}
                >
                    Vista previa
                </button>
            </nav>
        </div>
    );

    const renderInfoStep = () => (
        <div className="space-y-10">
            {/* Información básica */}
            <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-6">
                    Información básica
                </h2>

                <div>
                    <label
                        htmlFor="contract-type"
                        className="block text-xs font-medium text-slate-400 mb-2"
                    >
                        Tipo de contrato
                    </label>
                    <div className="relative">
                        <select
                            id="contract-type"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option>Contrato de alquiler</option>
                            <option>Acuerdo de confidencialidad (NDA)</option>
                            <option>Contrato de prestación de servicios</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500 text-lg">
                            ▾
                        </span>
                    </div>
                </div>
            </section>

            {/* Información de las partes */}
            <section className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-50">
                    Información de las partes
                </h3>

                {/* Arrendador / Parte A */}
                <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-3">
                        Arrendador
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="lessor-name"
                                className="block text-xs font-medium text-slate-400 mb-2"
                            >
                                Nombre completo
                            </label>
                            <input
                                id="lessor-name"
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lessor-id"
                                className="block text-xs font-medium text-slate-400 mb-2"
                            >
                                Documento de identidad
                            </label>
                            <input
                                id="lessor-id"
                                type="text"
                                placeholder="Ej: 12.345.678-X"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Arrendatario / Parte B */}
                <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-3">
                        Arrendatario
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label
                                htmlFor="lessee-name"
                                className="block text-xs font-medium text-slate-400 mb-2"
                            >
                                Nombre completo
                            </label>
                            <input
                                id="lessee-name"
                                type="text"
                                placeholder="Ej: María Rodríguez"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="lessee-id"
                                className="block text-xs font-medium text-slate-400 mb-2"
                            >
                                Documento de identidad
                            </label>
                            <input
                                id="lessee-id"
                                type="text"
                                placeholder="Ej: 98.765.432-Y"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Detalles del inmueble */}
            <section>
                <h3 className="text-lg font-semibold text-slate-50">
                    Detalles del inmueble
                </h3>

                <div className="mt-4 space-y-6">
                    <div>
                        <label
                            htmlFor="property-address"
                            className="block text-xs font-medium text-slate-400 mb-2"
                        >
                            Dirección del inmueble
                        </label>
                        <input
                            id="property-address"
                            type="text"
                            placeholder="Calle Falsa 123, Springfield"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="property-description"
                            className="block text-xs font-medium text-slate-400 mb-2"
                        >
                            Descripción (opcional)
                        </label>
                        <textarea
                            id="property-description"
                            rows={4}
                            placeholder="Ej: Apartamento de 2 habitaciones, 1 baño..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </section>
        </div>
    );

    const renderClausesStep = () => (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-3">
                    Cláusulas del contrato
                </h2>
                <p className="text-sm text-slate-400 max-w-2xl">
                    Selecciona las cláusulas que quieres incluir y personaliza su
                    contenido. Más adelante conectaremos esto con la IA para generar el
                    texto completo automáticamente.
                </p>
            </section>

            <section className="space-y-4">
                {[
                    "Duración del contrato",
                    "Renta y forma de pago",
                    "Depósito / Fianza",
                    "Mantenimiento y reparaciones",
                    "Penalización por incumplimiento",
                    "Renovación y terminación",
                ].map((label) => (
                    <label
                        key={label}
                        className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 hover:border-blue-500/60 transition-colors cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                            defaultChecked
                        />
                        <div>
                            <div className="font-semibold">{label}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                Texto de ejemplo estático por ahora. Más adelante lo generará
                                la IA a partir de tus parámetros.
                            </p>
                        </div>
                    </label>
                ))}
            </section>

            <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-50">
                    Cláusulas personalizadas
                </h3>
                <p className="text-xs text-slate-400">
                    Añade cualquier cláusula adicional que quieras incluir en el contrato.
                </p>
                <textarea
                    rows={6}
                    placeholder="Ej: El arrendatario podrá utilizar la plaza de garaje nº 12..."
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </section>
        </div>
    );

    const renderPreviewStep = () => (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-3">
                    Vista previa del contrato
                </h2>
                <p className="text-sm text-slate-400 max-w-2xl">
                    Esta es una vista previa estática basada en los datos de ejemplo. Más
                    adelante la IA generará el documento final en base a la información y
                    cláusulas seleccionadas.
                </p>
            </section>

            <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-100 shadow-lg shadow-black/20">
                <h3 className="text-lg font-semibold mb-4">
                    Contrato de alquiler de vivienda
                </h3>

                <p className="mb-3 text-xs text-slate-400">
                    Lugar y fecha: Sevilla, a 1 de enero de 2025.
                </p>

                <p className="mb-3">
                    REUNIDOS, de una parte <span className="font-semibold">Juan Pérez</span>,
                    en adelante <span className="italic">el Arrendador</span>, y de otra
                    parte <span className="font-semibold">María Rodríguez</span>, en
                    adelante <span className="italic">la Arrendataria</span>, quienes se
                    reconocen mutua capacidad legal suficiente para contratar y, a tal
                    efecto,
                    <span className="font-semibold"> MANIFIESTAN</span>:
                </p>

                <ol className="list-decimal ml-5 space-y-2">
                    <li>
                        Que el Arrendador es legítimo propietario de la vivienda situada en
                        Calle Falsa 123, Springfield.
                    </li>
                    <li>
                        Que la Arrendataria está interesada en el arrendamiento de la
                        vivienda, aceptando las condiciones económicas y de uso pactadas.
                    </li>
                </ol>

                <p className="mt-4 mb-2 font-semibold">CLÁUSULAS</p>
                <ol className="list-decimal ml-5 space-y-2">
                    <li>
                        <span className="font-semibold">Duración:</span> El presente
                        contrato tendrá una duración inicial de 12 meses, comenzando el 1
                        de febrero de 2025.
                    </li>
                    <li>
                        <span className="font-semibold">Renta:</span> La renta mensual
                        queda fijada en 800 €, pagaderos dentro de los cinco primeros días
                        de cada mes mediante transferencia bancaria.
                    </li>
                    <li>
                        <span className="font-semibold">Depósito / Fianza:</span> La
                        Arrendataria entrega en este acto la cantidad de 1.600 € en
                        concepto de fianza, equivalente a dos mensualidades.
                    </li>
                </ol>

                <p className="mt-6 text-xs text-slate-500">
                    * Nota: contenido de ejemplo. Cuando integremos la IA, esta sección se
                    generará dinámicamente con tus datos reales.
                </p>
            </section>
        </div>
    );

    const renderFooter = () => (
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
                Paso{" "}
                {step === "info" ? "1 de 3 · Información" : step === "clauses" ? "2 de 3 · Cláusulas" : "3 de 3 · Vista previa"}
            </div>
            <div className="flex gap-3 justify-end">
                {step !== "info" && (
                    <button
                        type="button"
                        onClick={() =>
                            setStep(step === "clauses" ? "info" : "clauses")
                        }
                        className="rounded-lg border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                    >
                        Volver
                    </button>
                )}

                {step !== "preview" && (
                    <button
                        type="button"
                        onClick={() =>
                            setStep(step === "info" ? "clauses" : "preview")
                        }
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                        {step === "info" ? "Siguiente: Cláusulas" : "Siguiente: Vista previa"}
                    </button>
                )}

                {step === "preview" && (
                    <button
                        type="button"
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                        Generar contrato
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <header className="mb-8 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                        ←
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                            Generar contrato
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Completa los datos básicos, elige las cláusulas y revisa la vista
                            previa antes de generar el documento.
                        </p>
                    </div>
                </header>

                {renderTabs()}

                {step === "info" && renderInfoStep()}
                {step === "clauses" && renderClausesStep()}
                {step === "preview" && renderPreviewStep()}

                {renderFooter()}
            </div>
        </DashboardLayout>
    );
};

export default GenerateContractPage;
