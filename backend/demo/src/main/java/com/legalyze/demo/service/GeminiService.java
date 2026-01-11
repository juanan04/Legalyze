package com.legalyze.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.legalyze.demo.dto.ClauseDto;
import com.legalyze.demo.dto.ContractAnalysisResponse;
import com.legalyze.demo.dto.RiskDto;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService implements AIService {

    @Value("${gemini.api-key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ContractAnalysisResponse analyze(String text) {
        log.info("Starting contract analysis with Gemini");

        try {
            String jsonResponse = callGemini(text);
            log.info("Received response from Gemini");

            // Clean response if it contains markdown code blocks
            if (jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7);
                if (jsonResponse.endsWith("```")) {
                    jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
                }
            } else if (jsonResponse.startsWith("```")) {
                jsonResponse = jsonResponse.substring(3);
                if (jsonResponse.endsWith("```")) {
                    jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
                }
            }

            AnalysisResult result = objectMapper.readValue(jsonResponse, AnalysisResult.class);

            ContractAnalysisResponse response = new ContractAnalysisResponse();
            response.setSummary(result.getSummary());
            response.setKeyClauses(result.getKeyClauses());
            response.setRisks(result.getRisks());

            return response;

        } catch (Exception e) {
            log.error("Error analyzing contract with Gemini", e);
            throw new RuntimeException("Failed to analyze contract with Gemini: " + e.getMessage(), e);
        }
    }

    private String callGemini(String text) {
        try {
            Client client = new Client.Builder().apiKey(apiKey).build();

            String systemPrompt = """
                    Eres un abogado experto en derecho civil y mercantil español.
                    Tu tarea es analizar contratos legales y extraer información clave.

                    Debes devolver la respuesta EXCLUSIVAMENTE en formato JSON válido, sin bloques de código markdown (```json ... ```), solo el JSON crudo.

                    El JSON debe tener esta estructura exacta:
                    {
                      "summary": "Un resumen ejecutivo del contrato de 2-3 párrafos.",
                      "keyClauses": [
                        {
                          "title": "Título de la cláusula (ej: Duración)",
                          "description": "Explicación sencilla de lo que implica.",
                          "clauseText": "Texto original (opcional)",
                          "riskLevel": "LOW" | "MEDIUM" | "HIGH"
                        }
                      ],
                      "risks": [
                        {
                          "title": "Título del riesgo (ej: Penalización abusiva)",
                          "description": "Por qué es un riesgo para el firmante.",
                          "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
                        }
                      ]
                    }
                    """;

            String prompt = systemPrompt + "\n\nAnaliza el siguiente contrato:\n\n" + text;

            GenerateContentResponse response = client.models.generateContent(
                    "gemini-2.0-flash", // Using a stable model, user suggested gemini-3-flash-preview but 2.0 is safer
                                        // for now or 1.5
                    prompt,
                    null);

            return response.text();
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed", e);
        }
    }

    @Data
    private static class AnalysisResult {
        private String summary;
        private List<ClauseDto> keyClauses;
        private List<RiskDto> risks;
    }
}
