package com.legalyze.demo.service.ai;

import com.legalyze.demo.dto.GenerateAiContractRequest;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatCompletion;
import com.openai.models.ChatCompletionCreateParams;

import com.openai.models.ChatCompletionUserMessageParam;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OpenAiContractGenerator implements AiContractGenerator {

    @Value("${OPENAI_API_KEY}")
    private String apiKey;

    @Value("${OPENAI_MODEL:gpt-4o}")
    private String model;

    @Override
    public AiContractResult generate(GenerateAiContractRequest request) {
        OpenAIClient client = OpenAIOkHttpClient.builder()
                .apiKey(apiKey)
                .build();

        String prompt = buildPrompt(request);

        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                .model(model)
                .addMessage(ChatCompletionUserMessageParam.builder()
                        .content(prompt)
                        .build())
                .build();

        ChatCompletion completion = client.chat().completions().create(params);
        String content = completion.choices().get(0).message().content().orElse("");

        return parseContent(content);
    }

    private String buildPrompt(GenerateAiContractRequest request) {
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
        sb.append("\nINSTRUCCIONES CLAVE DE FORMATO Y CONTENIDO:\n");
        sb.append(
                "1. ROL: Eres un abogado senior con 20 años de experiencia. Redacta un contrato FORMAL, RIGUROSO y EXHAUSTIVO.\n");
        sb.append("2. ESTRUCTURA OBLIGATORIA (Usa estas etiquetas HTML):\n");
        sb.append("   - TÍTULO: <h1>TÍTULO DEL CONTRATO</h1> (Centrado y en mayúsculas)\n");
        sb.append("   - LUGAR Y FECHA: <p>En [Ciudad], a [Fecha]</p>\n");
        sb.append(
                "   - SECCIONES PRINCIPALES: <h2>REUNIDOS</h2>, <h2>INTERVIENEN</h2>, <h2>EXPONEN</h2>, <h2>ESTIPULACIONES</h2> (Usa <h2>).\n");
        sb.append("   - CLÁUSULAS: Usa <h3>PRIMERA. - Objeto</h3>, <h3>SEGUNDA. - Duración</h3>, etc.\n");
        sb.append("   - PÁRRAFOS: Usa <p> para todo el texto. El texto debe ser denso y detallado.\n");
        sb.append("   - LISTAS: Usa <ul> o <ol> para enumeraciones dentro de las cláusulas.\n");
        sb.append("3. CONTENIDO DETALLADO:\n");
        sb.append("   - Desarrolla cada cláusula con múltiples párrafos si es necesario. Evita la brevedad.\n");
        sb.append("   - Incluye referencias a leyes vigentes (LAU, Código Civil, etc.) cuando aplique.\n");
        sb.append("4. FIRMAS:\n");
        sb.append("   - Al final, crea una tabla o div para las firmas.\n");
        sb.append("   - Usa <div class='signature-box'>...</div> si es posible, o simplemente <p>Fdo: ...</p>\n");
        sb.append(
                "5. DISCLAIMER: Añade al final en letra pequeña: <p style='font-size: 8pt; color: gray; text-align: center; margin-top: 20px;'>Documento generado por IA. No constituye asesoramiento legal.</p>\n");
        sb.append(
                "6. FORMATO FINAL: Solo entrega el código HTML dentro de los marcadores '---HTML_START---' y '---HTML_END---'. No uses Markdown.\n");
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
            // Fallback: try to find markdown code blocks
            if (content.contains("```html")) {
                int start = content.indexOf("```html") + 7;
                int end = content.indexOf("```", start);
                if (end == -1)
                    end = content.length();
                html = content.substring(start, end).trim();
                text = content.replace(content.substring(start - 7, Math.min(end + 3, content.length())), "").trim();
            } else if (content.trim().startsWith("<") && content.trim().endsWith(">")) {
                // Assume the whole content is HTML if it looks like it
                html = content;
                text = "Contract generated.";
            } else {
                // Last resort
                html = "<html><body><pre>" + content + "</pre></body></html>";
            }
        }

        // Cleanup: Remove any remaining markdown artifacts from HTML
        if (html.startsWith("```html")) {
            html = html.substring(7);
        }
        if (html.startsWith("```")) {
            html = html.substring(3);
        }
        if (html.endsWith("```")) {
            html = html.substring(0, html.length() - 3);
        }

        return AiContractResult.builder()
                .text(text)
                .html(html)
                .build();
    }
}
