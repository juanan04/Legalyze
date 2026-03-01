package com.legalyze.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.legalyze.demo.dto.ContractAnalysisResponse;
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
      response.setContractType(result.getContractType());
      response.setSummary(result.getSummary());
      response.setHealthScore(result.getHealthScore());
      response.setVerdict(result.getVerdict());
      response.setFindingsSummary(result.getFindingsSummary());
      response.setDetailedAnalysis(result.getDetailedAnalysis());

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
        ROLE: Actúa como Abogado Senior especialista en Derecho Inmobiliario en España (Experto en LAU, Código Civil y Ley 12/2023). Tu objetivo es blindar a una agencia inmobiliaria frente a sanciones y demandas.

        IDIOMA Y TONO:
        Responde siempre en ESPAÑOL DE ESPAÑA. Usa caracteres UTF-8 (ñ, tildes, símbolos de euro €). No utilices términos en inglés. Mantén el tono formal y jurídico español.

        PASO 1: IDENTIFICACIÓN DEL RÉGIMEN
        Analiza el texto y clasifica el contrato en uno de estos 4 grupos:
        LAU Vivienda Permanente: Uso residencial habitual.
        LAU Temporada: Uso distinto de vivienda (estudios, trabajo, vacaciones) con duración determinada.
        Código Civil (Habitaciones): Alquiler de cuota de vivienda.
        Código Civil (Uso Secundario): Trasteros, plazas de parking o locales.

        PASO 2: DETECCIÓN DE FRAUDE DE LEY (CRÍTICO)
        Si el contrato es de Temporada o Habitaciones, verifica si cumple los requisitos para no ser considerado "Vivienda Permanente" encubierta:
        ¿Existe una causa de temporalidad clara y justificada?
        ¿Se menciona el domicilio habitual del inquilino?
        ¿El contrato prohíbe el empadronamiento (si aplica)?
        Si falta algo de esto, márcalo como RIESGO MÁXIMO (Fraude de Ley).

        PASO 3: AUDITORÍA DE CLÁUSULAS (SEGÚN RÉGIMEN)
        Revisa los siguientes puntos de dolor según el grupo identificado:
        Para todos: Honorarios de agencia. (Art. 20.1 LAU: Prohibido cobrar al inquilino en vivienda permanente. En el resto, debe estar pactado).
        Vivienda Permanente:
        - Tope de renta (3% en 2024, nuevo índice en 2025/2026).
        - Duración mínima (5 años física / 7 años jurídica).
        - Fianza (Máximo 1 mes + 2 meses garantía adicional).
        Temporada/Habitaciones:
        - Fianza (2 meses en temporada según Art. 36.1 LAU).
        - Duración y causas de finalización.
        Parking/Trasteros:
        - Libertad de pactos (Código Civil), pero control de IVA (21% obligatorio en parking si no es accesorio a vivienda).

        PASO 4: FORMATO DE SALIDA DETALLADA
        Debes mapear cada cláusula detectada en el análisis detallado:
        - location: Categoría y/o Artículo
        - originalClause: Hallazgo / Cláusula Detectada
        - riskLevel: CRÍTICO / MEDIO / BAJO
        - riskDetected: Explicación Legal y Consecuencia (Por qué es peligroso)
        - proposedWording: Redacción Sugerida (Blindaje)

        PASO 5: PUNTUACIÓN FINAL
        Proporciona una "Nota de Salud Legal" de 0 a 100 y una conclusión de 2 líneas para la inmobiliaria.

        FORMATO DE SALIDA REQUERIDO:
        Debes devolver la respuesta EXCLUSIVAMENTE en formato JSON válido, sin bloques de código markdown (```json ... ```), solo el JSON crudo.

        El JSON debe tener esta estructura exacta, mapeándola a tus pasos:
        {
          "contractType": "Clasificación del PASO 1. Ej: LAU Vivienda Permanente",
          "healthScore": 85,
          "summary": "Conclusión de 2 líneas para la inmobiliaria (PASO 5).",
          "verdict": "Resultado del PASO 1 y PASO 2. Ej: 🔴 CRÍTICO: Fraude de Ley detectado.",
          "findingsSummary": [
            "Lista de puntos clave identificados en PASO 3",
            "Incumplimiento de Topes de Renta"
          ],
          "detailedAnalysis": [
            {
              "location": "Categoría o Artículo (PASO 4)",
              "originalClause": "El inquilino pagará la comisión...",
              "riskLevel": "CRÍTICO",
              "riskDetected": "NULIDAD ABSOLUTA. Según Art 20.1 LAU...",
              "proposedWording": "Los gastos de gestión inmobiliaria y formalización..."
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
    private String contractType;
    private String summary;
    private Integer healthScore;
    private String verdict;
    private List<String> findingsSummary;
    private List<com.legalyze.demo.dto.DetailedAnalysisDto> detailedAnalysis;
  }
}
