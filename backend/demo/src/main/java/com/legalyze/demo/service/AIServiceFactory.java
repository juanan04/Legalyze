package com.legalyze.demo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AIServiceFactory {

    private final OpenAIService openAIService;
    private final GeminiService geminiService;

    @Value("${ai.provider}")
    private String aiProvider;

    public AIService getService() {
        if ("GEMINI".equalsIgnoreCase(aiProvider)) {
            return geminiService;
        } else if ("OPENAI".equalsIgnoreCase(aiProvider)) {
            return openAIService;
        }
        throw new IllegalArgumentException("Invalid or missing AI_PROVIDER. Configured value: '" + aiProvider
                + "'. Set it to 'OPENAI' or 'GEMINI'.");
    }
}
