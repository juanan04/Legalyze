package com.legalyze.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.legalyze.demo.dto.ContractAnalysisResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

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
            response.setContractType(result.getContractType());
            response.setSummary(result.getSummary());
            response.setHealthScore(result.getHealthScore());
            response.setVerdict(result.getVerdict());
            response.setFindingsSummary(result.getFindingsSummary());
            response.setDetailedAnalysis(result.getDetailedAnalysis());

            return response;

        } catch (Exception e) {
            log.error("Error analyzing contract with Gemini", e);
            throw new RuntimeException("Failed to analyze contract with Gemini: " + e.getMessage(), e);
        }
    }

    private String callGemini(String text) {
        try {
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

            String prompt = systemPrompt + "\n\nAnaliza el siguiente contrato:\n\n" + text;

            // Using native Java HttpClient to bypass SDK encoding issues on Windows
            ObjectNode root = objectMapper.createObjectNode();

            ArrayNode contents = objectMapper.createArrayNode();
            ObjectNode content = objectMapper.createObjectNode();
            ArrayNode parts = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", prompt);
            parts.add(part);
            content.set("parts", parts);
            contents.add(content);
            root.set("contents", contents);

            // Adding exact response rules for JSON formatting via generation config
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("responseMimeType", "application/json");
            root.set("generationConfig", generationConfig);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="
                                    + apiKey))
                    .header("Content-Type", "application/json; charset=utf-8")
                    .POST(HttpRequest.BodyPublishers.ofString(root.toString(), StandardCharsets.UTF_8))
                    .build();

            HttpClient httpClient = HttpClient.newHttpClient();
            HttpResponse<String> httpResp = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (httpResp.statusCode() != 200) {
                throw new RuntimeException("Error from Gemini API: " + httpResp.body());
            }

            com.fasterxml.jackson.databind.JsonNode responseNode = objectMapper.readTree(httpResp.body());
            return responseNode.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();

        } catch (Exception e) {
            throw new RuntimeException("Gemini HTTP call failed", e);
        }
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
