package com.legalyze.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GenerateContractResponse {
    private Long id;
    private String templateCode;
    private LocalDateTime createdAt;
    private String generatedText;
    private String downloadUrl;
}
