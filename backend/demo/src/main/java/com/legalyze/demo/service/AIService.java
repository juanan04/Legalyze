package com.legalyze.demo.service;

import com.legalyze.demo.dto.ContractAnalysisResponse;

public interface AIService {
    ContractAnalysisResponse analyze(String text);
}
