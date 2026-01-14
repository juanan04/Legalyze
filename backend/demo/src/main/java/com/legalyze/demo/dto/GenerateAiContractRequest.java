package com.legalyze.demo.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateAiContractRequest {
    private String templateCode;
    private Map<String, String> fields;
    private ContractTone tone;
    private List<ClauseSelectionDto> clauses;
    private List<String> customClauses;
}
