package com.legalyze.demo.service.ai;

import com.legalyze.demo.dto.GenerateAiContractRequest;

public interface AiContractGenerator {
    AiContractResult generate(GenerateAiContractRequest request);
}
