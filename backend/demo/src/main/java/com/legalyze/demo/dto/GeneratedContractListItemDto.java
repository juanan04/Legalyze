package com.legalyze.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GeneratedContractListItemDto {
    private Long id;
    private String templateCode;
    private String templateName;
    private LocalDateTime createdAt;
}
