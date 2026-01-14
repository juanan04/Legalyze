package com.legalyze.demo.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AiContractGeneratorFactory {

    private final OpenAiContractGenerator openAiGenerator;
    private final GeminiContractGenerator geminiGenerator;

    @Value("${AI_PROVIDER:OPENAI}")
    private String aiProvider;

    public AiContractGenerator getGenerator() {
        if ("GEMINI".equalsIgnoreCase(aiProvider)) {
            return geminiGenerator;
        }
        return openAiGenerator;
    }
}
