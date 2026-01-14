import { useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Lock, ChevronRight, ChevronLeft, Check, AlertCircle, FileText, Edit2, Plus, Trash2 } from "lucide-react";
import {
    ContractFormSchema,
    type ContractFormValues,
    type ContractCategory,
    type ContractSubtype,
    CATEGORY_LABELS,
    SUBTYPE_LABELS,
    CATEGORY_SUBTYPES,
    PARTY_LABELS,
    DEFAULT_CLAUSES
} from "../../schemas/ContractFormSchema";

// Mapping new subtypes to backend template codes (legacy support)
const TEMPLATE_CODE_MAPPING: Record<string, string> = {
    RENTAL_HOUSING: "RENTAL_LAU",
    RENTAL_ROOM: "RENTAL_ROOM",
    SALE_VEHICLE: "VEHICLE_SALE",
    SERVICE_PROFESSIONAL: "SERVICE_AGREEMENT",
    SERVICE_SPOT: "SERVICE_AGREEMENT",
};

type Step = "config" | "data" | "preview";

interface GeneratedContractResponse {
    id: number;
    templateCode: string;
    createdAt: string;
    generatedText: string;
    generatedHtml: string;
    downloadUrl: string;
}

const GenerateContractPage: FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<Step>("config");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContract, setGeneratedContract] = useState<GeneratedContractResponse | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [showPartyModal, setShowPartyModal] = useState(false);

    const {
        register,
        control,
        watch,
        setValue,
        getValues,
        trigger,
        formState: { errors }
    } = useForm<ContractFormValues>({
        resolver: zodResolver(ContractFormSchema),
        defaultValues: {
            place: "Sevilla",
            date: new Date().toISOString().split('T')[0],
            selectedClauses: [],
            customClauses: [],
            clauseDescriptions: {},
            parties: []
        },
        mode: "onChange"
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "parties"
    });

    const { fields: customClausesFields, append: appendCustomClause, remove: removeCustomClause } = useFieldArray({
        control,
        name: "customClauses"
    });

    const selectedCategory = watch("category");
    const selectedSubtype = watch("subtype");
    const selectedClauses = watch("selectedClauses");

    // --- Handlers ---

    const handleCategorySelect = (category: ContractCategory) => {
        setValue("category", category);
        setValue("subtype", null as any);
    };

    const handleSubtypeSelect = (subtype: ContractSubtype) => {
        setValue("subtype", subtype);

        // Set default clauses
        const category = getValues("category");
        if (category && DEFAULT_CLAUSES[category]) {
            setValue("selectedClauses", DEFAULT_CLAUSES[category]);
        }

        // Initialize default parties (One A, One B) - Not removable
        if (category && PARTY_LABELS[category]) {
            setValue("parties", [
                { type: "PARTY_A", role: PARTY_LABELS[category].partyA, name: "", identification: "", isRemovable: false },
                { type: "PARTY_B", role: PARTY_LABELS[category].partyB, name: "", identification: "", isRemovable: false }
            ]);
        }
    };

    const handleAddParty = (type: "PARTY_A" | "PARTY_B" | "GUARANTOR") => {
        const category = getValues("category");
        let roleLabel = "";

        if (type === "PARTY_A") roleLabel = PARTY_LABELS[category].partyA;
        else if (type === "PARTY_B") roleLabel = PARTY_LABELS[category].partyB;
        else roleLabel = "Avalista";

        append({ type, role: roleLabel, name: "", identification: "", isRemovable: true });
        setShowPartyModal(false);
    };

    const getPlural = (word: string) => {
        const lastChar = word.slice(-1).toLowerCase();
        if (['a', 'e', 'i', 'o', 'u'].includes(lastChar)) {
            return word + 's';
        }
        return word + 'es';
    };

    const handleNextToData = () => {
        if (selectedCategory && selectedSubtype) {
            setStep("data");
        }
    };

    const handleNextToPreview = async () => {
        const result = await trigger();
        if (result) {
            setStep("preview");
        }
    };

    const handleAiGenerate = async () => {
        setIsLoading(true);
        setApiError(null);
        const data = getValues();

        try {
            const templateCode = TEMPLATE_CODE_MAPPING[data.subtype] || data.subtype;

            const fields: Record<string, any> = {
                place: data.place,
                date: data.date,
                contractType: data.subtype,
                propertyAddress: data.propertyAddress,
                monthlyRent: data.monthlyRent,
                depositAmount: data.depositAmount,
                roomDescription: data.roomDescription,
                vehicleMake: data.vehicleMake,
                vehicleModel: data.vehicleModel,
                vehiclePlate: data.vehiclePlate,
                price: data.price,
                serviceDescription: data.serviceDescription,
                paymentTerms: data.paymentTerms,
                loanAmount: data.loanAmount,
                returnDate: data.returnDate,
            };

            // Format parties string
            const partiesA = data.parties.filter(p => p.type === "PARTY_A");
            const partiesB = data.parties.filter(p => p.type === "PARTY_B");
            const guarantors = data.parties.filter(p => p.type === "GUARANTOR");

            let partiesStr = "";
            partiesA.forEach(p => partiesStr += `${p.role}: ${p.name} (${p.identification})\n`);
            partiesB.forEach(p => partiesStr += `${p.role}: ${p.name} (${p.identification})\n`);
            if (guarantors.length > 0) {
                partiesStr += "\nAvalistas:\n";
                guarantors.forEach(p => partiesStr += `${p.role}: ${p.name} (${p.identification})\n`);
            }

            fields.parties = partiesStr.trim();

            const clauses = data.selectedClauses.map(key => ({
                key,
                enabled: true,
                description: data.clauseDescriptions?.[key] || null
            }));

            // Format custom clauses as strings "Title: Description"
            const formattedCustomClauses = data.customClauses.map(c => `${c.title}: ${c.description}`);

            const payload = {
                templateCode,
                fields,
                tone: "NEUTRAL",
                clauses,
                customClauses: formattedCustomClauses
            };

            const response = await api.post("/api/generated-contracts/ai", payload);
            setGeneratedContract(response.data);

            localStorage.setItem("legalyze:lastAiGenerated", JSON.stringify({
                ...response.data,
                createdAt: new Date().toISOString()
            }));

        } catch (err: any) {
            console.error(err);
            if (err.response?.data?.code === "NO_CREDITS" || err.response?.status === 403) {
                setApiError("No tienes créditos suficientes.");
            } else if (err.response?.data?.message) {
                setApiError(err.response.data.message);
            } else if (err instanceof Error) {
                setApiError(err.message);
            } else {
                setApiError("Error al generar el contrato. Por favor, inténtalo de nuevo.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedContract) return;
        try {
            const response = await api.get(generatedContract.downloadUrl, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contrato-${generatedContract.id}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            setApiError("Error al descargar el archivo.");
        }
    };

    // --- Render Steps ---

    const renderConfigStep = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">¿Qué tipo de contrato necesitas?</h2>
                <p className="text-slate-400">Selecciona la categoría y el subtipo para comenzar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.keys(CATEGORY_LABELS).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategorySelect(cat as ContractCategory)}
                        className={`p-6 rounded-xl border transition-all text-left space-y-2
                            ${selectedCategory === cat
                                ? "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500"
                                : "border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600"
                            }`}
                    >
                        <div className="font-semibold text-lg text-white">{CATEGORY_LABELS[cat as ContractCategory]}</div>
                    </button>
                ))}
            </div>

            {selectedCategory && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-medium text-slate-300">Selecciona una opción:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {CATEGORY_SUBTYPES[selectedCategory].map((sub) => (
                            <button
                                key={sub}
                                onClick={() => handleSubtypeSelect(sub)}
                                className={`p-4 rounded-lg border transition-all text-left
                                    ${selectedSubtype === sub
                                        ? "border-blue-500 bg-blue-500/10 text-white"
                                        : "border-slate-700 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-600"
                                    }`}
                            >
                                {SUBTYPE_LABELS[sub]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-end pt-8">
                <button
                    onClick={handleNextToData}
                    disabled={!selectedCategory || !selectedSubtype}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    Continuar <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderPartyCard = (field: any, index: number) => (
        <div key={field.id} className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-4 relative group">
            <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold text-blue-400">{field.role}</h4>
                {field.isRemovable && (
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="space-y-2">
                <label className="text-xs text-slate-400">Nombre completo / Razón Social</label>
                <input
                    {...register(`parties.${index}.name`)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
                {errors.parties?.[index]?.name && <p className="text-red-400 text-xs">{errors.parties[index]?.name?.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-xs text-slate-400">DNI / NIF</label>
                <input
                    {...register(`parties.${index}.identification`)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
                {errors.parties?.[index]?.identification && <p className="text-red-400 text-xs">{errors.parties[index]?.identification?.message}</p>}
            </div>
            {/* Hidden fields for type and role */}
            <input type="hidden" {...register(`parties.${index}.type`)} />
            <input type="hidden" {...register(`parties.${index}.role`)} />
            <input type="hidden" {...register(`parties.${index}.isRemovable`)} />
        </div>
    );

    const renderDataStep = () => {
        const category = selectedCategory!;
        const subtype = selectedSubtype!;

        // Filter fields by type for rendering
        const partyAFields = fields.map((f, i) => ({ ...f, index: i })).filter(f => f.type === "PARTY_A");
        const partyBFields = fields.map((f, i) => ({ ...f, index: i })).filter(f => f.type === "PARTY_B");
        const guarantorFields = fields.map((f, i) => ({ ...f, index: i })).filter(f => f.type === "GUARANTOR");

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">{SUBTYPE_LABELS[subtype]}</h2>
                        <p className="text-sm text-slate-400">{CATEGORY_LABELS[category]}</p>
                    </div>
                    <button onClick={() => setStep("config")} className="text-sm text-blue-400 hover:underline">
                        Cambiar tipo
                    </button>
                </div>

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Lugar de firma</label>
                        <input
                            {...register("place")}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.place && <p className="text-red-400 text-xs">{errors.place.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Fecha</label>
                        <input
                            type="date"
                            {...register("date")}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.date && <p className="text-red-400 text-xs">{errors.date.message}</p>}
                    </div>
                </div>

                {/* Parties Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Intervinientes</h3>
                        <button
                            type="button"
                            onClick={() => setShowPartyModal(true)}
                            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium"
                        >
                            <Plus className="w-4 h-4" /> Añadir parte
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Side A */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                                {getPlural(PARTY_LABELS[category].partyA)}
                            </h4>
                            <div className="space-y-4">
                                {partyAFields.map(field => renderPartyCard(field, field.index))}
                            </div>
                        </div>

                        {/* Side B + Guarantors */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                                {getPlural(PARTY_LABELS[category].partyB)}
                            </h4>
                            <div className="space-y-4">
                                {partyBFields.map(field => renderPartyCard(field, field.index))}

                                {guarantorFields.length > 0 && (
                                    <div className="pl-4 border-l-2 border-slate-700 space-y-4 mt-4">
                                        <h5 className="text-xs font-semibold text-slate-500 uppercase">Avalistas</h5>
                                        {guarantorFields.map(field => renderPartyCard(field, field.index))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specific Fields */}
                <div className="space-y-4 pt-6 border-t border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Detalles del Contrato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {category === "RENTAL" && (
                            <>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Dirección del inmueble</label>
                                    <input {...register("propertyAddress")} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                    {errors.propertyAddress && <p className="text-red-400 text-xs">{errors.propertyAddress.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Renta Mensual (€)</label>
                                    <input type="number" {...register("monthlyRent", { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                    {errors.monthlyRent && <p className="text-red-400 text-xs">{errors.monthlyRent.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Fianza (€)</label>
                                    <input type="number" {...register("depositAmount", { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </>
                        )}

                        {subtype === "SALE_VEHICLE" && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Marca</label>
                                    <input {...register("vehicleMake")} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Modelo</label>
                                    <input {...register("vehicleModel")} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Matrícula</label>
                                    <input {...register("vehiclePlate")} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                    {errors.vehiclePlate && <p className="text-red-400 text-xs">{errors.vehiclePlate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Precio (€)</label>
                                    <input type="number" {...register("price", { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </>
                        )}

                        {category === "SERVICE" && (
                            <>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Descripción del Servicio</label>
                                    <textarea rows={3} {...register("serviceDescription")} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Precio (€)</label>
                                    <input type="number" {...register("price", { valueAsNumber: true })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Clauses */}
                <div className="space-y-4 pt-4 border-t border-slate-700">
                    <h3 className="text-lg font-semibold text-white">Cláusulas</h3>
                    <div className="space-y-3">
                        {DEFAULT_CLAUSES[category]?.map((clause) => (
                            <div key={clause} className="space-y-2">
                                <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 cursor-pointer hover:border-blue-500/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        value={clause}
                                        {...register("selectedClauses")}
                                        className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-200">{clause}</span>
                                </label>
                                {selectedClauses?.includes(clause) && (
                                    <div className="ml-7">
                                        <textarea
                                            placeholder={`Detalles adicionales para: ${clause}`}
                                            {...register(`clauseDescriptions.${clause}`)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
                                            rows={2}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Custom Clauses */}
                    <div className="space-y-3 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-300">Cláusulas Personalizadas</h4>
                            <button
                                type="button"
                                onClick={() => appendCustomClause({ title: "", description: "" })}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Añadir
                            </button>
                        </div>

                        {customClausesFields.map((field, index) => (
                            <div key={field.id} className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg space-y-2 group">
                                <div className="flex items-center gap-2">
                                    <input
                                        placeholder="Título de la cláusula"
                                        {...register(`customClauses.${index}.title`)}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCustomClause(index)}
                                        className="text-slate-500 hover:text-red-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <textarea
                                    placeholder="Descripción detallada..."
                                    {...register(`customClauses.${index}.description`)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none"
                                    rows={2}
                                />
                                {errors.customClauses?.[index]?.title && <p className="text-red-400 text-xs">{errors.customClauses[index]?.title?.message}</p>}
                                {errors.customClauses?.[index]?.description && <p className="text-red-400 text-xs">{errors.customClauses[index]?.description?.message}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between pt-8">
                    <button
                        onClick={() => setStep("config")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Atrás
                    </button>
                    <button
                        onClick={handleNextToPreview}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Revisar Contrato <FileText className="w-4 h-4" />
                    </button>
                </div>

                {/* Add Party Modal */}
                {showPartyModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-bold text-white mb-4">Añadir Interviniente</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleAddParty("PARTY_A")}
                                    className="w-full p-3 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-left transition-all"
                                >
                                    <div className="font-semibold text-blue-400">{PARTY_LABELS[category].partyA}</div>
                                    <div className="text-xs text-slate-400">Añadir otra parte de este tipo</div>
                                </button>
                                <button
                                    onClick={() => handleAddParty("PARTY_B")}
                                    className="w-full p-3 rounded-lg border border-slate-700 hover:border-purple-500 hover:bg-purple-500/10 text-left transition-all"
                                >
                                    <div className="font-semibold text-purple-400">{PARTY_LABELS[category].partyB}</div>
                                    <div className="text-xs text-slate-400">Añadir otra parte de este tipo</div>
                                </button>
                                <button
                                    onClick={() => handleAddParty("GUARANTOR")}
                                    className="w-full p-3 rounded-lg border border-slate-700 hover:border-green-500 hover:bg-green-500/10 text-left transition-all"
                                >
                                    <div className="font-semibold text-green-400">Avalista</div>
                                    <div className="text-xs text-slate-400">Añadir un avalista para la parte B</div>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowPartyModal(false)}
                                className="mt-6 w-full py-2 text-sm text-slate-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPreviewStep = () => {
        const data = getValues();

        if (generatedContract) {
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-6 h-6 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">¡Contrato Generado!</h2>
                        <p className="text-slate-400">Tu contrato ha sido generado exitosamente con IA.</p>
                        <button
                            onClick={handleDownload}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-500/20 transition-all transform hover:scale-105 cursor-pointer"
                        >
                            Descargar Word
                        </button>
                    </div>

                    <div className="bg-white text-black p-8 rounded-xl shadow-2xl overflow-auto max-h-[600px] font-serif">
                        <div dangerouslySetInnerHTML={{ __html: generatedContract.generatedHtml }} />
                    </div>

                    <button onClick={() => setGeneratedContract(null)} className="text-slate-400 hover:text-white text-sm mx-auto block cursor-pointer">
                        Generar otro contrato
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 space-y-6 max-w-3xl mx-auto">
                    <div className="text-center border-b border-slate-700 pb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Resumen del Contrato</h2>
                        <p className="text-slate-400">{SUBTYPE_LABELS[data.subtype]} - {data.place}, {data.date}</p>
                    </div>

                    <div className="space-y-6">
                        {data.parties.map((p, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-slate-800 pb-2 last:border-0">
                                <div>
                                    <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{p.role}</h3>
                                    <p className="text-white">{p.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-sm">{p.identification}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-700 pt-6">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Detalles y Cláusulas</h3>
                        <ul className="space-y-2 text-slate-300">
                            {data.propertyAddress && <li><span className="text-slate-500">Inmueble:</span> {data.propertyAddress}</li>}
                            {data.monthlyRent && <li><span className="text-slate-500">Renta:</span> {data.monthlyRent}€</li>}
                            {data.price && <li><span className="text-slate-500">Precio:</span> {data.price}€</li>}

                            <li className="pt-2 font-medium text-white">Cláusulas seleccionadas:</li>
                            {data.selectedClauses.map(c => (
                                <li key={c} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-500 mt-1" />
                                    <span>{c}</span>
                                </li>
                            ))}

                            {data.customClauses.length > 0 && (
                                <>
                                    <li className="pt-2 font-medium text-white">Cláusulas personalizadas:</li>
                                    {data.customClauses.map((c, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className="w-4 h-4 text-blue-500 mt-1" />
                                            <span>{c.title}</span>
                                        </li>
                                    ))}
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                {apiError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        {apiError}
                    </div>
                )}

                <div className="flex justify-between max-w-3xl mx-auto">
                    <button
                        onClick={() => setStep("data")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2"
                    >
                        <Edit2 className="w-4 h-4" /> Editar datos
                    </button>
                    <button
                        onClick={handleAiGenerate}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isLoading ? "Generando..." : "Generar Contrato Final con IA"}
                    </button>
                </div>
            </div>
        );
    };

    if (!user?.emailVerified) {
        return (
            <DashboardLayout>
                <div className="relative min-h-[60vh] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Lock className="w-12 h-12 text-yellow-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Función Bloqueada</h2>
                        <p className="text-slate-400">Verifica tu correo para acceder.</p>
                        <button onClick={() => navigate("/dashboard")} className="text-blue-400 hover:underline cursor-pointer">Volver</button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-800 -z-10" />
                    <div className={`flex items-center gap-2 ${step === "config" ? "text-blue-400" : "text-slate-500"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "config" ? "bg-blue-500 text-white" : "bg-slate-800"}`}>1</div>
                        <span className="hidden sm:inline font-medium">Configuración</span>
                    </div>
                    <div className={`flex items-center gap-2 ${step === "data" ? "text-blue-400" : "text-slate-500"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "data" ? "bg-blue-500 text-white" : "bg-slate-800"}`}>2</div>
                        <span className="hidden sm:inline font-medium">Datos</span>
                    </div>
                    <div className={`flex items-center gap-2 ${step === "preview" ? "text-blue-400" : "text-slate-500"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === "preview" ? "bg-blue-500 text-white" : "bg-slate-800"}`}>3</div>
                        <span className="hidden sm:inline font-medium">Revisión</span>
                    </div>
                </div>

                {step === "config" && renderConfigStep()}
                {step === "data" && renderDataStep()}
                {step === "preview" && renderPreviewStep()}
            </div>
        </DashboardLayout>
    );
};

export default GenerateContractPage;
