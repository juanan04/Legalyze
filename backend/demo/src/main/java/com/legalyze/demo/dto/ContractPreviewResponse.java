package com.legalyze.demo.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ContractPreviewResponse {
    private int pageCount;
    private int wordCount;
    private List<String> detectedSections;
    private Map<String, Boolean> basicChecklist;
    private String previewText; // First 500 chars for UI preview
}
