package com.legalyze.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ContractAnalysisResponse {

    private Long id;
    private String originalFileName;
    private LocalDateTime uploadedAt;
    private String status;
    private String summary;
    private List<ClauseDto> keyClauses;
    private List<RiskDto> risks;

}
