import { useState, type FC, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Lock } from "lucide-react";
import {
    type ContractData,
    type ContractType,
    CONTRACT_TYPES,
    DEFAULT_CLAUSES,
    type Party,
    type RentalLauData,
    type RentalRoomData,
    type VehicleSaleData,
    type ServiceAgreementData
} from "../../types/contract";

type Step = "info" | "clauses" | "preview";

interface GeneratedContractResponse {
    id: number;
    templateCode: string;
    createdAt: string;
    generatedText: string;
    downloadUrl: string;
}

const GenerateContractPage: FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>("info");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContract, setGeneratedContract] = useState<GeneratedContractResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Party Modal State
    const [showPartyModal, setShowPartyModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");

    // Initial state helper
    const getInitialState = (type: ContractType): ContractData => {
        const base = {
            contractType: type,
            place: "Sevilla",
            date: new Date().toISOString().split('T')[0],
            parties: [
                { id: crypto.randomUUID(), role: getRoleName(type, 0), name: "", identification: "", isRemovable: false },
                { id: crypto.randomUUID(), role: getRoleName(type, 1), name: "", identification: "", isRemovable: false }
            ],
            clauses: DEFAULT_CLAUSES[type],
            customClauses: []
        };

        switch (type) {
            case "RENTAL_LAU":
                return { ...base, contractType: "RENTAL_LAU", propertyAddress: "", propertyDescription: "", durationMonths: 12, monthlyRent: 0, depositAmount: 0 };
            case "RENTAL_ROOM":
                return { ...base, contractType: "RENTAL_ROOM", propertyAddress: "", roomDescription: "", commonAreas: "", durationMonths: 6, monthlyRent: 0, depositAmount: 0 };
            case "VEHICLE_SALE":
                return { ...base, contractType: "VEHICLE_SALE", vehicleMake: "", vehicleModel: "", vehiclePlate: "", vehicleVin: "", price: 0 };
            case "SERVICE_AGREEMENT":
                return { ...base, contractType: "SERVICE_AGREEMENT", serviceDescription: "", price: 0, paymentTerms: "" };
            default:
                return base as unknown as ContractData;
        }
    };

    const getRoleName = (type: ContractType, index: number): string => {
        switch (type) {
            case "RENTAL_LAU":
            case "RENTAL_ROOM":
                return index === 0 ? "Arrendador" : "Arrendatario";
            case "VEHICLE_SALE":
                return index === 0 ? "Vendedor" : "Comprador";
            case "SERVICE_AGREEMENT":
                return index === 0 ? "Prestador" : "Cliente";
            default:
                return "Parte " + (index + 1);
        }
    };

    const getAvailableRoles = (type: ContractType): string[] => {
        switch (type) {
            case "RENTAL_LAU":
            case "RENTAL_ROOM":
                return ["Arrendador", "Arrendatario", "Avalista"];
            case "VEHICLE_SALE":
                return ["Vendedor", "Comprador", "Avalista"];
            case "SERVICE_AGREEMENT":
                return ["Prestador", "Cliente", "Avalista"];
            default:
                return ["Parte", "Avalista"];
        }
    };

    const [formData, setFormData] = useState<ContractData>(getInitialState("RENTAL_LAU"));
    const [customClauseInput, setCustomClauseInput] = useState("");

    const handleTypeChange = (newType: ContractType) => {
        setFormData(getInitialState(newType));
        setStep("info"); // Reset step
        setFormErrors({});
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field if it exists
        if (formErrors[field as string]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field as string];
                return newErrors;
            });
        }
    };

    const handlePartyChange = (id: string, field: keyof Party, value: string) => {
        setFormData((prev) => ({
            ...prev,
            parties: prev.parties.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
        }));

        // Clear error for this party field
        const errorKey = `party_${id}_${field === 'identification' ? 'id' : 'name'}`;
        if (formErrors[errorKey]) {
            setFormErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[errorKey];
                return newErrors;
            });
        }
    };

    const openAddPartyModal = () => {
        const roles = getAvailableRoles(formData.contractType);
        setSelectedRole(roles[0]); // Default to first role
        setShowPartyModal(true);
    };

    const confirmAddParty = () => {
        setFormData((prev) => ({
            ...prev,
            parties: [
                ...prev.parties,
                { id: crypto.randomUUID(), role: selectedRole, name: "", identification: "", isRemovable: true }
            ]
        }));
        setShowPartyModal(false);
    };

    const removeParty = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            parties: prev.parties.filter((p) => p.id !== id || !p.isRemovable)
        }));
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
            const trimmed = customClauseInput.trim();
            if (trimmed) {
                setFormData((prev) => ({
                    ...prev,
                    customClauses: [...prev.customClauses, trimmed]
                }));
                setCustomClauseInput("");
            }
        }
    };

    const validateInfoStep = () => {
        const errors: Record<string, string> = {};

        // Validate Parties
        formData.parties.forEach((party) => {
            if (!party.name.trim()) errors[`party_${party.id}_name`] = "El nombre es obligatorio";
            if (!party.identification.trim()) errors[`party_${party.id}_id`] = "El documento es obligatorio";
        });

        // Validate Specific Fields
        if (formData.contractType === "RENTAL_LAU") {
            const data = formData as RentalLauData;
            if (!data.propertyAddress.trim()) errors.propertyAddress = "La dirección es obligatoria";
            if (data.monthlyRent <= 0) errors.monthlyRent = "La renta debe ser mayor a 0";
        } else if (formData.contractType === "RENTAL_ROOM") {
            const data = formData as RentalRoomData;
            if (!data.propertyAddress.trim()) errors.propertyAddress = "La dirección es obligatoria";
            if (!data.roomDescription.trim()) errors.roomDescription = "La descripción de la habitación es obligatoria";
            if (data.monthlyRent <= 0) errors.monthlyRent = "La renta debe ser mayor a 0";
        } else if (formData.contractType === "VEHICLE_SALE") {
            const data = formData as VehicleSaleData;
            if (!data.vehicleMake.trim()) errors.vehicleMake = "La marca es obligatoria";
            if (!data.vehicleModel.trim()) errors.vehicleModel = "El modelo es obligatorio";
            if (!data.vehiclePlate.trim()) errors.vehiclePlate = "La matrícula es obligatoria";
            if (data.price <= 0) errors.price = "El precio debe ser mayor a 0";
        } else if (formData.contractType === "SERVICE_AGREEMENT") {
            const data = formData as ServiceAgreementData;
            if (!data.serviceDescription.trim()) errors.serviceDescription = "La descripción del servicio es obligatoria";
            if (data.price <= 0) errors.price = "El precio debe ser mayor a 0";
        }

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
            // Construct fields based on contract type
            const fields: Record<string, any> = {
                place: formData.place,
                date: formData.date,
                contractType: formData.contractType,
                clauses: [...formData.clauses, ...formData.customClauses].join("\n"),
            };

            // Add parties
            fields.parties = formData.parties.map(p => `${p.role}: ${p.name} (${p.identification})`).join("\n");

            // Add specific fields
            if (formData.contractType === "RENTAL_LAU") {
                const data = formData as RentalLauData;
                fields.propertyAddress = data.propertyAddress;
                fields.monthlyRent = data.monthlyRent;
                fields.depositAmount = data.depositAmount;
            } else if (formData.contractType === "RENTAL_ROOM") {
                const data = formData as RentalRoomData;
                fields.propertyAddress = data.propertyAddress;
                fields.roomDescription = data.roomDescription;
                fields.monthlyRent = data.monthlyRent;
            } else if (formData.contractType === "VEHICLE_SALE") {
                const data = formData as VehicleSaleData;
                fields.vehicleMake = data.vehicleMake;
                fields.vehicleModel = data.vehicleModel;
                fields.vehiclePlate = data.vehiclePlate;
                fields.price = data.price;
            } else if (formData.contractType === "SERVICE_AGREEMENT") {
                const data = formData as ServiceAgreementData;
                fields.serviceDescription = data.serviceDescription;
                fields.price = data.price;
                fields.paymentTerms = data.paymentTerms;
            }

            const payload = {
                templateCode: formData.contractType,
                fields: fields,
            };

            const response = await api.post("/api/generated-contracts/generate", payload);
            setGeneratedContract(response.data);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error al generar el contrato. Por favor intenta de nuevo.");
            }
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

    if (!user?.emailVerified) {
        return (
            <DashboardLayout>
                <div className="relative min-h-[60vh] flex items-center justify-center">
                    {/* Blurred Background Content */}
                    <div className="absolute inset-0 filter blur-sm opacity-50 pointer-events-none select-none">
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-white mb-8">Generar Contrato</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="h-32 bg-slate-800 rounded-xl"></div>
                                <div className="h-32 bg-slate-800 rounded-xl"></div>
                                <div className="h-32 bg-slate-800 rounded-xl"></div>
                                <div className="h-32 bg-slate-800 rounded-xl"></div>
                            </div>
                        </div>
                    </div>

                    {/* Overlay Message */}
                    <div className="relative z-10 bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md text-center">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-yellow-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Función Bloqueada</h2>
                        <p className="text-slate-400 mb-6">
                            Para generar contratos legales con IA, necesitas verificar tu correo electrónico primero.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            Volver al Dashboard
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

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

    const renderInfoStep = () => {
        // Group parties by role
        const groups: Record<string, Party[]> = {};
        // Initialize groups based on available roles to ensure order
        const availableRoles = getAvailableRoles(formData.contractType);
        availableRoles.forEach(role => {
            groups[role] = [];
        });

        formData.parties.forEach(party => {
            if (!groups[party.role]) {
                groups[party.role] = [];
            }
            groups[party.role].push(party);
        });
        const groupedParties = groups;

        return (
            <div className="space-y-10">
                {/* Información básica */}
                <section>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-6">
                        Información básica
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">
                                Tipo de contrato
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.contractType}
                                    onChange={(e) => handleTypeChange(e.target.value as ContractType)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {CONTRACT_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">
                                Lugar de firma
                            </label>
                            <input
                                type="text"
                                value={formData.place}
                                onChange={(e) => handleInputChange("place", e.target.value)}
                                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Información de las partes */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-50">
                            Información de las partes
                        </h3>
                        <button
                            type="button"
                            onClick={openAddPartyModal}
                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                        >
                            + Añadir parte
                        </button>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(groupedParties).map(([role, parties]) => (
                            parties.length > 0 && (
                                <div key={role} className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                                        {role}s
                                    </h4>
                                    {parties.map((party, index) => (
                                        <div key={party.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 relative">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-sm font-semibold text-blue-400">
                                                    {party.role} {parties.length > 1 ? `(${index + 1})` : ""}
                                                </h4>
                                                {party.isRemovable && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeParty(party.id)}
                                                        className="text-slate-500 hover:text-red-400"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                                        Nombre completo / Razón Social
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={party.name}
                                                        onChange={(e) => handlePartyChange(party.id, "name", e.target.value)}
                                                        className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 ${formErrors[`party_${party.id}_name`]
                                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                            : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                                            }`}
                                                    />
                                                    {formErrors[`party_${party.id}_name`] && (
                                                        <p className="mt-1 text-xs text-red-400">{formErrors[`party_${party.id}_name`]}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-400 mb-2">
                                                        Documento (DNI/NIE/CIF)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={party.identification}
                                                        onChange={(e) => handlePartyChange(party.id, "identification", e.target.value)}
                                                        className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 ${formErrors[`party_${party.id}_id`]
                                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                                            : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                                                            }`}
                                                    />
                                                    {formErrors[`party_${party.id}_id`] && (
                                                        <p className="mt-1 text-xs text-red-400">{formErrors[`party_${party.id}_id`]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ))}
                    </div>
                </section>

                {/* Detalles específicos del contrato */}
                <section>
                    <h3 className="text-lg font-semibold text-slate-50 mb-4">
                        Detalles del contrato
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        {formData.contractType === "RENTAL_LAU" && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">Dirección del inmueble</label>
                                    <input
                                        type="text"
                                        value={(formData as RentalLauData).propertyAddress}
                                        onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                                        className={`w-full rounded-lg border bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 ${formErrors.propertyAddress ? "border-red-500" : "border-slate-700 focus:border-blue-500"}`}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Renta mensual (€)</label>
                                        <input
                                            type="number"
                                            value={(formData as RentalLauData).monthlyRent}
                                            onChange={(e) => handleInputChange("monthlyRent", parseFloat(e.target.value))}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Fianza (€)</label>
                                        <input
                                            type="number"
                                            value={(formData as RentalLauData).depositAmount}
                                            onChange={(e) => handleInputChange("depositAmount", parseFloat(e.target.value))}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.contractType === "RENTAL_ROOM" && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">Dirección del inmueble</label>
                                    <input
                                        type="text"
                                        value={(formData as RentalRoomData).propertyAddress}
                                        onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">Descripción de la habitación</label>
                                    <input
                                        type="text"
                                        value={(formData as RentalRoomData).roomDescription}
                                        onChange={(e) => handleInputChange("roomDescription", e.target.value)}
                                        placeholder="Ej: Habitación exterior con baño propio"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Renta mensual (€)</label>
                                        <input
                                            type="number"
                                            value={(formData as RentalRoomData).monthlyRent}
                                            onChange={(e) => handleInputChange("monthlyRent", parseFloat(e.target.value))}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.contractType === "VEHICLE_SALE" && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Marca</label>
                                        <input
                                            type="text"
                                            value={(formData as VehicleSaleData).vehicleMake}
                                            onChange={(e) => handleInputChange("vehicleMake", e.target.value)}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Modelo</label>
                                        <input
                                            type="text"
                                            value={(formData as VehicleSaleData).vehicleModel}
                                            onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Matrícula</label>
                                        <input
                                            type="text"
                                            value={(formData as VehicleSaleData).vehiclePlate}
                                            onChange={(e) => handleInputChange("vehiclePlate", e.target.value)}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Precio (€)</label>
                                        <input
                                            type="number"
                                            value={(formData as VehicleSaleData).price}
                                            onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.contractType === "SERVICE_AGREEMENT" && (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-2">Descripción del servicio</label>
                                    <textarea
                                        rows={3}
                                        value={(formData as ServiceAgreementData).serviceDescription}
                                        onChange={(e) => handleInputChange("serviceDescription", e.target.value)}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Precio total (€)</label>
                                        <input
                                            type="number"
                                            value={(formData as ServiceAgreementData).price}
                                            onChange={(e) => handleInputChange("price", parseFloat(e.target.value))}
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-2">Condiciones de pago</label>
                                        <input
                                            type="text"
                                            value={(formData as ServiceAgreementData).paymentTerms}
                                            onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                                            placeholder="Ej: 50% al inicio, 50% al final"
                                            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Add Party Modal */}
                {showPartyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
                            <h3 className="text-lg font-bold text-slate-50 mb-4">
                                Añadir nueva parte
                            </h3>
                            <div className="mb-6">
                                <label className="block text-xs font-medium text-slate-400 mb-2">
                                    Rol de la parte
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {getAvailableRoles(formData.contractType).map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPartyModal(false)}
                                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmAddParty}
                                    className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                                >
                                    Añadir
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderClausesStep = () => {
        const defaultClauses = DEFAULT_CLAUSES[formData.contractType] || [];

        return (
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
                    {defaultClauses.map((label) => (
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
                    <div className="space-y-2">
                        {formData.customClauses.map((clause, index) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-900/50 text-sm text-slate-300">
                                <span>{clause}</span>
                                <button
                                    onClick={() => {
                                        const newCustomClauses = formData.customClauses.filter((_, i) => i !== index);
                                        setFormData(prev => ({ ...prev, customClauses: newCustomClauses }));
                                    }}
                                    className="text-slate-500 hover:text-red-400"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <textarea
                        rows={3}
                        value={customClauseInput}
                        onChange={(e) => setCustomClauseInput(e.target.value)}
                        onKeyDown={handleCustomClauseKeyDown}
                        placeholder="Escribe tu cláusula y presiona Enter para añadirla..."
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </section>
            </div>
        );
    };

    const renderPreviewStep = () => (
        <div className="space-y-8">
            <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mb-3">
                    Vista previa del contrato
                </h2>
                <p className="text-sm text-slate-400 max-w-2xl">
                    Esta es una vista previa estática basada en los datos introducidos.
                    La IA generará el documento final basándose en esta estructura.
                </p>
            </section>

            {generatedContract ? (
                <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-100 shadow-lg shadow-black/20 whitespace-pre-wrap">
                    {generatedContract.generatedText}
                </section>
            ) : (
                <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-6 text-sm leading-relaxed text-slate-100 shadow-lg shadow-black/20">
                    <h3 className="text-lg font-semibold mb-4">
                        {CONTRACT_TYPES.find(t => t.value === formData.contractType)?.label}
                    </h3>

                    <p className="mb-3 text-xs text-slate-400">
                        Lugar y fecha: {formData.place}, a {new Date(formData.date).toLocaleDateString()}.
                    </p>

                    <div className="mb-4 space-y-2">
                        <p className="font-semibold">PARTES:</p>
                        <ul className="list-disc ml-5 space-y-1 text-slate-300">
                            {formData.parties.map((party, index) => (
                                <li key={index}>
                                    <span className="font-medium">{party.role}:</span> {party.name} ({party.identification})
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="mt-4 mb-2 font-semibold">CLÁUSULAS SELECCIONADAS</p>
                    <ul className="list-disc ml-5 space-y-2 text-slate-300">
                        {formData.clauses.map((clause, index) => (
                            <li key={`default-${index}`}>{clause}</li>
                        ))}
                        {formData.customClauses.map((clause, index) => (
                            <li key={`custom-${index}`}>{clause} (Personalizada)</li>
                        ))}
                    </ul>

                    <p className="mt-6 text-xs text-slate-500 italic">
                        * Este es un resumen de los datos. El contrato final será generado por IA con redacción legal profesional.
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
