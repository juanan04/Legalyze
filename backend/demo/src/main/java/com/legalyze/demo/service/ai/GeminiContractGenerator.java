package com.legalyze.demo.service.ai;

import com.legalyze.demo.dto.GenerateAiContractRequest;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiContractGenerator implements AiContractGenerator {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    @Value("${GEMINI_MODEL:gemini-2.0-flash-exp}")
    private String model;

    @Override
    public AiContractResult generate(GenerateAiContractRequest request) {
        // Note: Assuming Google Gen AI SDK usage based on context.
        // Adjusting to standard usage pattern if needed.
        Client client = Client.builder().apiKey(apiKey).build();

        String prompt = buildPrompt(request);

        try {
            GenerateContentResponse response = client.models.generateContent(model, prompt, null);
            String content = response.text();
            return parseContent(content);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate contract with Gemini", e);
        }
    }

    private String buildPrompt(GenerateAiContractRequest request) {
        // Same prompt logic as OpenAI to ensure consistency
        StringBuilder sb = new StringBuilder();
        sb.append("Genera un contrato legal completo en base a los siguientes datos:\n");
        sb.append("Plantilla: ").append(request.getTemplateCode()).append("\n");
        sb.append("Datos: ").append(request.getFields()).append("\n");
        sb.append("Tono: ").append(request.getTone()).append("\n");
        sb.append("Cláusulas seleccionadas: \n");
        if (request.getClauses() != null) {
            request.getClauses().forEach(c -> {
                if (c.isEnabled()) {
                    sb.append("- ").append(c.getKey());
                    if (c.getDescription() != null && !c.getDescription().isEmpty()) {
                        sb.append(": ").append(c.getDescription());
                    }
                    sb.append("\n");
                }
            });
        }
        if (request.getCustomClauses() != null && !request.getCustomClauses().isEmpty()) {
            sb.append("Cláusulas personalizadas: ").append(request.getCustomClauses()).append("\n");
        }
        sb.append("\nINSTRUCCIONES:\n");
        sb.append("1. Genera el contrato en formato HTML limpio (sin markdown, solo etiquetas HTML semánticas).\n");
        sb.append(
                "2. Incluye secciones: Partes, Duración, Precio/Renta, Obligaciones, Resolución, Jurisdicción, Firmas.\n");
        sb.append(
                "3. Añade al final el disclaimer: 'Documento orientativo. No constituye asesoramiento legal. Revise con un profesional antes de firmar.'\n");
        sb.append(
                "4. SEPARA CLARAMENTE el texto plano del HTML. Usa el delimitador '---HTML_START---' y '---HTML_END---' para el bloque HTML.\n");
        sb.append("5. El resto debe ser texto plano legible.\n");
        return sb.toString();
    }

    private AiContractResult parseContent(String content) {
        String htmlMarkerStart = "---HTML_START---";
        String htmlMarkerEnd = "---HTML_END---";

        String html = "";
        String text = content;

        if (content.contains(htmlMarkerStart) && content.contains(htmlMarkerEnd)) {
            int start = content.indexOf(htmlMarkerStart) + htmlMarkerStart.length();
            int end = content.indexOf(htmlMarkerEnd);
            html = content.substring(start, end).trim();
            text = content
                    .replace(content.substring(content.indexOf(htmlMarkerStart), end + htmlMarkerEnd.length()), "")
                    .trim();
        } else {
            // Fallback if model fails to follow strict format
            html = "<html><body><pre>" + content + "</pre></body></html>";
        }

        return AiContractResult.builder()
                .text(text)
                .html(html)
                .build();
    }
}
