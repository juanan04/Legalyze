export interface DetailedAnalysis {
    location: string;
    originalClause: string;
    riskDetected: string;
    proposedWording: string;
    riskLevel: string;
}

export interface AnalysisResult {
    id: number;
    originalFileName: string;
    uploadedAt: string;
    status: string;
    contractType?: string;
    summary: string;
    healthScore: number;
    verdict: string;
    findingsSummary: string[];
    detailedAnalysis: DetailedAnalysis[];
}
