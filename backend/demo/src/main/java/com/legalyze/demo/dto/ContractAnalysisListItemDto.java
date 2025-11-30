package com.legalyze.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ContractAnalysisListItemDto {
    private Long id;
    private String originalFileName;
    private LocalDateTime uploadedAt;
    private String status;
    private String summary;
}
