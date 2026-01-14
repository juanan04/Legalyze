package com.legalyze.demo.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateAiContractResponse {
    private Long id;
    private String templateCode;
    private String generatedText;
    private String generatedHtml;
    private String downloadUrl;
    private Instant expiresAt;
}
