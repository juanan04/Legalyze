export interface Clause {
    title: string;
    description: string;
    clauseText: string;
    riskLevel: string;
}

export interface Risk {
    title: string;
    description: string;
    severity: string;
    quote?: string; // Added for highlighting support
}

export interface AnalysisResult {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    summary: string;
    keyClauses: Clause[];
    risks: Risk[];
}
