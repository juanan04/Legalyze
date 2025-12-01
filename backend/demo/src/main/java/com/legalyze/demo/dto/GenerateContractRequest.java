package com.legalyze.demo.dto;

import java.util.Map;

import lombok.Data;

@Data
public class GenerateContractRequest {
    private String templateCode;
    private Map<String, String> fields;
}
