package com.legalyze.demo.dto;

import lombok.Data;

@Data
public class DetailedAnalysisDto {
    private String location; 
    private String originalClause; 
    private String riskDetected; 
    private String proposedWording; 
    private String riskLevel; 
}
