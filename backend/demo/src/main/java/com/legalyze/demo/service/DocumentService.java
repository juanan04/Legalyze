package com.legalyze.demo.service;

import com.legalyze.demo.dto.ContractPreviewResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class DocumentService {

    public String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public int getPageCount(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            return document.getNumberOfPages();
        }
    }

    public ContractPreviewResponse generatePreview(MultipartFile file) {
        ContractPreviewResponse response = new ContractPreviewResponse();
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            // 1. Page Count
            response.setPageCount(document.getNumberOfPages());

            // 2. Text Extraction
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // 3. Word Count
            String[] words = text.split("\\s+");
            response.setWordCount(words.length);

            // 4. Preview Text (first 500 chars)
            response.setPreviewText(text.length() > 500 ? text.substring(0, 500) + "..." : text);

            // 5. Detect Sections (Basic Regex)
            response.setDetectedSections(detectSections(text));

            // 6. Basic Checklist
            response.setBasicChecklist(performBasicChecks(text));

        } catch (IOException e) {
            log.error("Error generating preview", e);
            throw new RuntimeException("Failed to process document for preview", e);
        }
        return response;
    }

    private List<String> detectSections(String text) {
        List<String> sections = new ArrayList<>();
        // Common Spanish contract headers
        String[] headers = {
                "REUNIDOS", "INTERVIENEN", "EXPONEN", "CLÁUSULAS", "ESTIPULACIONES",
                "OBJETO", "DURACIÓN", "PRECIO", "RENTA", "FIANZA", "FIRMAS"
        };

        for (String header : headers) {
            if (text.toUpperCase().contains(header)) {
                sections.add(header);
            }
        }
        return sections;
    }

    private Map<String, Boolean> performBasicChecks(String text) {
        Map<String, Boolean> checks = new HashMap<>();
        String upperText = text.toUpperCase();

        // Check for DNI/NIF pattern (supports 12345678Z, 12.345.678-Z, etc.)
        checks.put("Identificación (DNI/NIF)",
                Pattern.compile("\\b(\\d{1,3}(\\.?\\d{3}){2})([-]?[A-Z])\\b").matcher(upperText).find()
                        || Pattern.compile("\\b\\d{8}[-]?[A-Z]\\b").matcher(upperText).find());

        // Check for Date
        checks.put("Fecha detectada", Pattern.compile("\\d{1,2}.+\\d{4}").matcher(text).find());

        // Check for Signatures area
        checks.put("Zona de Firmas", upperText.contains("FDO") || upperText.contains("FIRMA"));

        return checks;
    }
}
