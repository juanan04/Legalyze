package com.legalyze.demo.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.legalyze.demo.dto.ClauseDto;
import com.legalyze.demo.dto.ContractAnalysisResponse;
import com.legalyze.demo.dto.RiskDto;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatCompletionCreateParams;
import com.openai.models.ChatCompletionSystemMessageParam;
import com.openai.models.ChatCompletionUserMessageParam;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class OpenAIService implements AIService {

  @Value("${openai.api-key}")
  private String apiKey;

  private final ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public ContractAnalysisResponse analyze(String text) {
    log.info("Starting contract analysis with OpenAI");

    try {
      // 1. Call OpenAI API
      String jsonResponse = callOpenAI(text);
      log.info("Received response from OpenAI");

      // 2. Parse JSON
      AnalysisResult result = objectMapper.readValue(jsonResponse, AnalysisResult.class);

      // 3. Map to Response
      ContractAnalysisResponse response = new ContractAnalysisResponse();
      response.setSummary(result.getSummary());
      response.setKeyClauses(result.getKeyClauses());
      response.setRisks(result.getRisks());

      return response;

    } catch (com.openai.errors.RateLimitException e) {
      log.error("Error de cuota OpenAI: No hay dinero suficiente o se excedió el límite. {}", e.getMessage());
      throw new RuntimeException("No hay dinero suficiente en la cuenta de OpenAI o se ha excedido el límite de cuota.",
          e);
    } catch (Exception e) {
      log.error("Error analyzing contract", e);
      throw new RuntimeException("Failed to analyze contract: " + e.getMessage(), e);
    }
  }

  private String callOpenAI(String text) {
    OpenAIClient client = OpenAIOkHttpClient.builder()
        .apiKey(apiKey)
        .build();

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
              "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
              "quote": "El fragmento de texto exacto del contrato que justifica este riesgo"
            }
          ]
        }
        """;

    ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
        .model("gpt-4o-mini") // Use string to avoid enum issues
        .addMessage(ChatCompletionSystemMessageParam.builder()
            .content(systemPrompt)
            .build())
        .addMessage(ChatCompletionUserMessageParam.builder()
            .content("Analiza el siguiente contrato:\n\n" + text)
            .build())
        // Fallback to prompt engineering for JSON if ResponseFormat builder is tricky
        // in this version
        // .responseFormat(...)
        .build();

    return client.chat().completions().create(params).choices().get(0).message().content().orElse("{}");
  }

  @Data
  private static class AnalysisResult {
    private String summary;
    private List<ClauseDto> keyClauses;
    private List<RiskDto> risks;
  }
}
