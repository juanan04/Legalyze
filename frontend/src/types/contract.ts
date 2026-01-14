export type ContractType = "RENTAL_LAU" | "RENTAL_ROOM" | "VEHICLE_SALE" | "SERVICE_AGREEMENT";

export interface Party {
    id: string; // Internal ID for React keys
    role: string; // e.g., "Arrendador", "Vendedor"
    name: string;
    identification: string; // DNI/NIE/CIF
    address?: string; // Optional, depends on contract
    isRemovable?: boolean; // Defaults to true if undefined, false for default parties
}

export interface BaseContractData {
    contractType: ContractType;
    place: string; // e.g., "Sevilla"
    date: string; // ISO date or string
    parties: Party[];
    clauses: string[];
    clauseDescriptions: Record<string, string>;
    customClauses: string[];
}

// Specific fields for each contract type
export interface RentalLauData extends BaseContractData {
    contractType: "RENTAL_LAU";
    propertyAddress: string;
    propertyDescription: string;
    durationMonths: number;
    monthlyRent: number;
    depositAmount: number; // Fianza
}

export interface RentalRoomData extends BaseContractData {
    contractType: "RENTAL_ROOM";
    propertyAddress: string;
    roomDescription: string; // Which room
    commonAreas: string; // Description of allowed common areas
    durationMonths: number;
    monthlyRent: number;
    depositAmount: number;
}

export interface VehicleSaleData extends BaseContractData {
    contractType: "VEHICLE_SALE";
    vehicleMake: string; // Marca
    vehicleModel: string;
    vehiclePlate: string; // Matrícula
    vehicleVin: string; // Bastidor
    price: number;
}

export interface ServiceAgreementData extends BaseContractData {
    contractType: "SERVICE_AGREEMENT";
    serviceDescription: string;
    price: number;
    paymentTerms: string; // e.g., "50% upfront"
    durationDays?: number;
}

export type ContractData =
    | RentalLauData
    | RentalRoomData
    | VehicleSaleData
    | ServiceAgreementData;

export const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
    { value: "RENTAL_LAU", label: "Alquiler Vivienda (LAU)" },
    { value: "RENTAL_ROOM", label: "Alquiler Habitación" },
    { value: "VEHICLE_SALE", label: "Compra-venta Vehículo" },
    { value: "SERVICE_AGREEMENT", label: "Prestación de Servicios" },
];

export const DEFAULT_CLAUSES: Record<ContractType, string[]> = {
    RENTAL_LAU: [
        "Objeto del arrendamiento",
        "Duración del contrato",
        "Renta y actualización",
        "Fianza legal",
        "Gastos y suministros",
        "Conservación de la vivienda",
        "Prohibición de subarriendo"
    ],
    RENTAL_ROOM: [
        "Objeto del arrendamiento (habitación)",
        "Uso de zonas comunes",
        "Duración",
        "Precio y forma de pago",
        "Normas de convivencia",
        "Prohibición de pernocta de terceros"
    ],
    VEHICLE_SALE: [
        "Objeto de la compraventa",
        "Precio y forma de pago",
        "Estado del vehículo",
        "Cargas y gravámenes",
        "Cambio de titularidad",
        "Fuero aplicable"
    ],
    SERVICE_AGREEMENT: [
        "Objeto del servicio",
        "Precio y facturación",
        "Duración y plazos",
        "Confidencialidad",
        "Propiedad intelectual",
        "Resolución del contrato"
    ]
};
