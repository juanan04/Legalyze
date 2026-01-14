import { z } from "zod";

// --- Enums & Constants ---

export const ContractCategoryEnum = z.enum(["RENTAL", "SALE", "LOAN", "SERVICE"]);
export type ContractCategory = z.infer<typeof ContractCategoryEnum>;

export const ContractSubtypeEnum = z.enum([
    "RENTAL_HOUSING", "RENTAL_ROOM", "RENTAL_STORAGE",
    "SALE_PROPERTY", "SALE_VEHICLE",
    "LOAN_FAMILY", "LOAN_FRIENDS",
    "SERVICE_SPOT", "SERVICE_PROFESSIONAL"
]);
export type ContractSubtype = z.infer<typeof ContractSubtypeEnum>;

export const CATEGORY_LABELS: Record<ContractCategory, string> = {
    RENTAL: "Arrendamiento",
    SALE: "Compraventa",
    LOAN: "Préstamo",
    SERVICE: "Prestación de Servicios"
};

export const SUBTYPE_LABELS: Record<ContractSubtype, string> = {
    RENTAL_HOUSING: "Vivienda (LAU)",
    RENTAL_ROOM: "Habitación",
    RENTAL_STORAGE: "Trastero/Garaje",
    SALE_PROPERTY: "Inmueble",
    SALE_VEHICLE: "Vehículo",
    LOAN_FAMILY: "Entre Familiares",
    LOAN_FRIENDS: "Entre Amigos",
    SERVICE_SPOT: "Trabajo Puntual",
    SERVICE_PROFESSIONAL: "Servicios Profesionales"
};

// Map Subtypes to Categories
export const CATEGORY_SUBTYPES: Record<ContractCategory, ContractSubtype[]> = {
    RENTAL: ["RENTAL_HOUSING", "RENTAL_ROOM", "RENTAL_STORAGE"],
    SALE: ["SALE_PROPERTY", "SALE_VEHICLE"],
    LOAN: ["LOAN_FAMILY", "LOAN_FRIENDS"],
    SERVICE: ["SERVICE_SPOT", "SERVICE_PROFESSIONAL"]
};

// Dynamic Party Labels
export const PARTY_LABELS: Record<ContractCategory, { partyA: string, partyB: string }> = {
    RENTAL: { partyA: "Arrendador", partyB: "Arrendatario" },
    SALE: { partyA: "Vendedor", partyB: "Comprador" },
    LOAN: { partyA: "Prestamista", partyB: "Prestatario" },
    SERVICE: { partyA: "Prestador", partyB: "Cliente" }
};

// Pre-defined Clauses
export const DEFAULT_CLAUSES: Record<ContractCategory, string[]> = {
    RENTAL: ["Fianza", "Duración y Prórroga", "Prohibición de subarriendo", "Actualización de renta (IPC)"],
    SALE: ["Saneamiento por vicios ocultos", "Cuerpo cierto / A la vista", "Cargas y gravámenes"],
    LOAN: ["Plazo de devolución", "Intereses / Sin Intereses", "Consecuencias de impago"],
    SERVICE: ["Confidencialidad (NDA)", "Propiedad Intelectual", "Plazos de ejecución", "Naturaleza mercantil"]
};

// --- Zod Schemas ---

export const PartyTypeEnum = z.enum(["PARTY_A", "PARTY_B", "GUARANTOR"]);
export type PartyType = z.infer<typeof PartyTypeEnum>;

export const PartySchema = z.object({
    type: PartyTypeEnum,
    role: z.string(), // Display label, e.g. "Arrendador"
    name: z.string().min(1, "El nombre es obligatorio"),
    identification: z.string().min(1, "El DNI/NIF es obligatorio"),
    isRemovable: z.boolean().optional()
});

export const ContractFormSchema = z.object({
    category: ContractCategoryEnum,
    subtype: ContractSubtypeEnum,

    // Common Fields
    place: z.string().min(1, "El lugar de firma es obligatorio"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha inválida"
    }),

    // Parties (Array)
    parties: z.array(PartySchema).refine((parties) => {
        const hasA = parties.some(p => p.type === "PARTY_A");
        const hasB = parties.some(p => p.type === "PARTY_B");
        return hasA && hasB;
    }, {
        message: "Debe haber al menos una parte de cada tipo principal."
    }),

    // Dynamic Fields
    propertyAddress: z.string().optional(),
    monthlyRent: z.number().min(0).optional(),
    depositAmount: z.number().min(0).optional(),
    roomDescription: z.string().optional(),

    vehicleMake: z.string().optional(),
    vehicleModel: z.string().optional(),
    vehiclePlate: z.string().optional(),
    price: z.number().min(0).optional(),

    loanAmount: z.number().min(0).optional(),
    returnDate: z.string().optional(),

    serviceDescription: z.string().optional(),
    paymentTerms: z.string().optional(),

    // Clauses
    selectedClauses: z.array(z.string()),
    customClauses: z.array(z.object({
        title: z.string().min(1, "El título es obligatorio"),
        description: z.string().min(1, "La descripción es obligatoria")
    })),
    clauseDescriptions: z.record(z.string(), z.string()).optional()
}).superRefine((data, ctx) => {
    // Custom Validations based on Subtype

    // RENTAL Validations
    if (data.category === "RENTAL") {
        if (!data.propertyAddress) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La dirección es obligatoria",
                path: ["propertyAddress"]
            });
        }
        if (data.monthlyRent === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La renta mensual es obligatoria",
                path: ["monthlyRent"]
            });
        }
    }

    // SALE Validations
    if (data.subtype === "SALE_VEHICLE") {
        if (!data.vehiclePlate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La matrícula es obligatoria",
                path: ["vehiclePlate"]
            });
        }
    }

    // Date Logic Validation
    if (data.returnDate && data.date) {
        if (new Date(data.returnDate) < new Date(data.date)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La fecha de devolución no puede ser anterior a la fecha de firma",
                path: ["returnDate"]
            });
        }
    }
});

export type ContractFormValues = z.infer<typeof ContractFormSchema>;
