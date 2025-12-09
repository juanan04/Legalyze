import { useState, type FC, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { api } from "../../lib/api";

type Step = "info" | "clauses" | "preview";

interface ContractData {
    contractType: string;
    lessorName: string;
    lessorId: string;
    lesseeName: string;
    lesseeId: string;
    propertyAddress: string;
    propertyDescription: string;
    clauses: string[];
    customClause: string;
}

interface GeneratedContractResponse {
    id: number;
    templateCode: string;
    createdAt: string;
    generatedText: string;
    downloadUrl: string;
}

const GenerateContractPage: FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>("info");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContract, setGeneratedContract] = useState<GeneratedContractResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContractData, string>>>({});

    const [availableClauses, setAvailableClauses] = useState<string[]>([
        "Duración del contrato",
        "Renta y forma de pago",
        "Depósito / Fianza",
        "Mantenimiento y reparaciones",
        "Penalización por incumplimiento",
        "Renovación y terminación",
    ]);

    const [formData, setFormData] = useState<ContractData>({
        contractType: "RENTAL",
        lessorName: "",
        lessorId: "",
        lesseeName: "",
        lesseeId: "",
        propertyAddress: "",
        propertyDescription: "",
        clauses: [
            "Duración del contrato",
            "Renta y forma de pago",
            "Depósito / Fianza",
            "Mantenimiento y reparaciones",
            "Penalización por incumplimiento",
            "Renovación y terminación",
        ],
        customClause: "",
    });

    const handleInputChange = (field: keyof ContractData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleClauseToggle = (clause: string) => {
        setFormData((prev) => {
            const newClauses = prev.clauses.includes(clause)
                ? prev.clauses.filter((c) => c !== clause)
                : [...prev.clauses, clause];
            return { ...prev, clauses: newClauses };
        });
    };

    const handleCustomClauseKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const trimmedClause = formData.customClause.trim();
            if (trimmedClause) {
                if (!availableClauses.includes(trimmedClause)) {
                    setAvailableClauses((prev) => [...prev, trimmedClause]);
                    setFormData((prev) => ({
                        ...prev,
                        clauses: [...prev.clauses, trimmedClause],
                        customClause: "",
                    }));
                } else if (!formData.clauses.includes(trimmedClause)) {
                    // If it exists but not selected, select it
                    setFormData((prev) => ({
                        ...prev,
                        clauses: [...prev.clauses, trimmedClause],
                        customClause: "",
                    }));
                } else {
                    // Already exists and selected, just clear input
                    setFormData((prev) => ({ ...prev, customClause: "" }));
                }
            }
        }
    };

    const validateId = (id: string) => {
        // Regex for generic ID validation:
        // - At least 5 characters
        // - Must contain at least one number
        // - Allowed characters: letters, numbers, dots, hyphens
        const idRegex = /^(?=.*\d)[A-Za-z0-9.-]{5,20}$/;
        return idRegex.test(id);
    };

    const validateInfoStep = () => {
        const errors: Partial<Record<keyof ContractData, string>> = {};

        if (!formData.lessorName.trim()) errors.lessorName = "El nombre del arrendador es obligatorio";

        if (!formData.lessorId.trim()) {
            errors.lessorId = "El documento del arrendador es obligatorio";
        } else if (!validateId(formData.lessorId)) {
            errors.lessorId = "Formato de documento inválido (ej: 12.345.678-X)";
        }

        if (!formData.lesseeName.trim()) errors.lesseeName = "El nombre del arrendatario es obligatorio";

        if (!formData.lesseeId.trim()) {
            errors.lesseeId = "El documento del arrendatario es obligatorio";
        } else if (!validateId(formData.lesseeId)) {
            errors.lesseeId = "Formato de documento inválido (ej: 12.345.678-X)";
        }

        if (!formData.propertyAddress.trim()) errors.propertyAddress = "La dirección del inmueble es obligatoria";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (step === "info") {
            if (validateInfoStep()) {
                setStep("clauses");
            }
        } else if (step === "clauses") {
            setStep("preview");
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const payload = {
                templateCode: formData.contractType,
                fields: {
                    lessorName: formData.lessorName,
                    lessorId: formData.lessorId,
                    lesseeName: formData.lesseeName,
                    lesseeId: formData.lesseeId,
                    propertyAddress: formData.propertyAddress,
                    propertyDescription: formData.propertyDescription,
                    clauses: formData.clauses.join(", "),
                    customClause: formData.customClause, // This might be empty if they added it to the list, but we send it anyway if they typed something without adding
                },
            };

            const response = await api.post("/api/generated-contracts/generate", payload);
            setGeneratedContract(response.data);
        } catch (err) {
            console.error(err);
            setError("Error al generar el contrato. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedContract) return;
        try {
            const response = await api.get(generatedContract.downloadUrl, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contrato-${generatedContract.id}.txt`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading file", err);
            setError("Error al descargar el archivo.");
        }
    };

    const renderTabs = () => (
        <div className="border-b border-slate-700 mb-8">
            <nav aria-label="Pasos de generación" className="-mb-px flex gap-8 text-sm">
                <div
                    className={`border-b-2 pb-3 font-medium transition-colors cursor-default ${step === "info"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400"
                        }`}
                >
                    Información
                </div>
                <div
                    className={`border-b-2 pb-3 font-medium transition-colors cursor-default ${step === "clauses"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400"
                        }`}
                >
                    Cláusulas
                </div>
                <div
                    className={`border-b-2 pb-3 font-medium transition-colors cursor-default ${step === "preview"
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-400"
                        }`}
                >
                    Vista previa
                </div>
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
                            value={formData.contractType}
                            onChange={(e) => handleInputChange("contractType", e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="RENTAL">Contrato de alquiler</option>
                            <option value="NDA">Acuerdo de confidencialidad (NDA)</option>
                            <option value="SERVICE">Contrato de prestación de servicios</option>
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
                                value={formData.lessorName}
                                onChange={(e) => handleInputChange("lessorName", e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${formErrors.lessorName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                    }`}
                            />
                            {formErrors.lessorName && (
                                <p className="mt-1 text-xs text-red-400">{formErrors.lessorName}</p>
                            )}
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
                                value={formData.lessorId}
                                onChange={(e) => handleInputChange("lessorId", e.target.value)}
                                placeholder="Ej: 12.345.678-X"
                                className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${formErrors.lessorId
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                    }`}
                            />
                            {formErrors.lessorId && (
                                <p className="mt-1 text-xs text-red-400">{formErrors.lessorId}</p>
                            )}
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
                                value={formData.lesseeName}
                                onChange={(e) => handleInputChange("lesseeName", e.target.value)}
                                placeholder="Ej: María Rodríguez"
                                className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${formErrors.lesseeName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                    }`}
                            />
                            {formErrors.lesseeName && (
                                <p className="mt-1 text-xs text-red-400">{formErrors.lesseeName}</p>
                            )}
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
                                value={formData.lesseeId}
                                onChange={(e) => handleInputChange("lesseeId", e.target.value)}
                                placeholder="Ej: 98.765.432-Y"
                                className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${formErrors.lesseeId
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                    }`}
                            />
                            {formErrors.lesseeId && (
                                <p className="mt-1 text-xs text-red-400">{formErrors.lesseeId}</p>
                            )}
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
                            value={formData.propertyAddress}
                            onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                            placeholder="Calle Falsa 123, Springfield"
                            className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${formErrors.propertyAddress
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                }`}
                        />
                        {formErrors.propertyAddress && (
                            <p className="mt-1 text-xs text-red-400">{formErrors.propertyAddress}</p>
                        )}
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
                            value={formData.propertyDescription}
                            onChange={(e) => handleInputChange("propertyDescription", e.target.value)}
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
                {availableClauses.map((label) => (
                    <label
                        key={label}
                        className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 hover:border-blue-500/60 transition-colors cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            checked={formData.clauses.includes(label)}
                            onChange={() => handleClauseToggle(label)}
                            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                        />
                        <div>
                            <div className="font-semibold">{label}</div>
                            <p className="text-xs text-slate-400 mt-1">
                                {["Duración del contrato", "Renta y forma de pago", "Depósito / Fianza", "Mantenimiento y reparaciones", "Penalización por incumplimiento", "Renovación y terminación"].includes(label)
                                    ? "Texto de ejemplo estático por ahora."
                                    : "Cláusula personalizada añadida."}
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
                    Añade cualquier cláusula adicional que quieras incluir en el contrato. Presiona Enter para añadirla a la lista.
                </p>
                <textarea
                    rows={4}
                    value={formData.customClause}
                    onChange={(e) => handleInputChange("customClause", e.target.value)}
                    onKeyDown={handleCustomClauseKeyDown}
                    placeholder="Escribe tu cláusula y presiona Enter para añadirla..."
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

            {generatedContract ? (
                <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-100 shadow-lg shadow-black/20 whitespace-pre-wrap">
                    {generatedContract.generatedText}
                </section>
            ) : (
                <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-100 shadow-lg shadow-black/20">
                    <h3 className="text-lg font-semibold mb-4">
                        {formData.contractType === "RENTAL" ? "Contrato de alquiler de vivienda" : formData.contractType}
                    </h3>

                    <p className="mb-3 text-xs text-slate-400">
                        Lugar y fecha: Sevilla, a {new Date().toLocaleDateString()}.
                    </p>

                    <p className="mb-3">
                        REUNIDOS, de una parte <span className="font-semibold">{formData.lessorName || "Juan Pérez"}</span>,
                        en adelante <span className="italic">el Arrendador</span>, y de otra
                        parte <span className="font-semibold">{formData.lesseeName || "María Rodríguez"}</span>, en
                        adelante <span className="italic">la Arrendataria</span>, quienes se
                        reconocen mutua capacidad legal suficiente para contratar y, a tal
                        efecto,
                        <span className="font-semibold"> MANIFIESTAN</span>:
                    </p>

                    <ol className="list-decimal ml-5 space-y-2">
                        <li>
                            Que el Arrendador es legítimo propietario de la vivienda situada en
                            {formData.propertyAddress || "Calle Falsa 123, Springfield"}.
                        </li>
                        <li>
                            Que la Arrendataria está interesada en el arrendamiento de la
                            vivienda, aceptando las condiciones económicas y de uso pactadas.
                        </li>
                    </ol>

                    <p className="mt-4 mb-2 font-semibold">CLÁUSULAS</p>
                    <ul className="list-disc ml-5 space-y-2">
                        {formData.clauses.map((clause, index) => (
                            <li key={index}>{clause}</li>
                        ))}
                    </ul>

                    <p className="mt-6 text-xs text-slate-500">
                        * Nota: contenido de ejemplo. Cuando integremos la IA, esta sección se
                        generará dinámicamente con tus datos reales.
                    </p>
                </section>
            )}
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
                        onClick={() => {
                            if (step === "clauses") setStep("info");
                            if (step === "preview") setStep("clauses");
                            setGeneratedContract(null); // Reset generated contract if going back
                        }}
                        className="rounded-lg border border-slate-600 bg-slate-900/70 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
                    >
                        Volver
                    </button>
                )}

                {step !== "preview" && (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                        {step === "info" ? "Siguiente: Cláusulas" : "Siguiente: Vista previa"}
                    </button>
                )}

                {step === "preview" && !generatedContract && (
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? "Generando..." : "Generar contrato"}
                    </button>
                )}

                {step === "preview" && generatedContract && (
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                        Descargar
                    </button>
                )}
            </div>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <header className="mb-8 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        ←
                    </button>
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
