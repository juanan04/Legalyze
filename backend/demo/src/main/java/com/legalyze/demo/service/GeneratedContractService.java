package com.legalyze.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.legalyze.demo.dto.GenerateContractRequest;
import com.legalyze.demo.dto.GenerateContractResponse;
import com.legalyze.demo.dto.GeneratedContractListItemDto;
import com.legalyze.demo.model.GeneratedContract;
import com.legalyze.demo.repository.GeneratedContractRepository;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class GeneratedContractService {

    private final GeneratedContractRepository generatedContractRepository;
    private final ObjectMapper objectMapper;
    private final UserService userService;

    public GenerateContractResponse generate(GenerateContractRequest request) {
        userService.validateUserAccess();

        // Nombre de plantilla dummy. Más adelante lo leeremos de ContractTemplate.
        String templateName = "Plantilla " + request.getTemplateCode();

        String filledDataJson = toJsonSafe(request.getFields());

        // Texto de contrato dummy. Más adelante lo generará la IA.
        String generatedText = buildDummyContractText(request.getTemplateCode(), request.getFields());

        GeneratedContract gc = GeneratedContract.builder()
                .templateCode(request.getTemplateCode())
                .templateName(templateName)
                .createdAt(LocalDateTime.now())
                .filledDataJson(filledDataJson)
                .generatedText(generatedText)
                .pdfPath(null) // lo rellenaremos cuando generemos el PDF de verdad
                .build();

        gc = generatedContractRepository.save(gc);

        GenerateContractResponse resp = new GenerateContractResponse();
        resp.setId(gc.getId());
        resp.setTemplateCode(gc.getTemplateCode());
        resp.setCreatedAt(gc.getCreatedAt());
        resp.setGeneratedText(gc.getGeneratedText());
        resp.setDownloadUrl("/api/generated-contracts/" + gc.getId() + "/download");
        return resp;
    }

    public List<GeneratedContractListItemDto> listAll() {
        return generatedContractRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(gc -> {
                    GeneratedContractListItemDto dto = new GeneratedContractListItemDto();
                    dto.setId(gc.getId());
                    dto.setTemplateCode(gc.getTemplateCode());
                    dto.setTemplateName(gc.getTemplateName());
                    dto.setCreatedAt(gc.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public GenerateContractResponse getById(Long id) {
        GeneratedContract gc = generatedContractRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Generated contract not found with id " + id));

        GenerateContractResponse resp = new GenerateContractResponse();
        resp.setId(gc.getId());
        resp.setTemplateCode(gc.getTemplateCode());
        resp.setCreatedAt(gc.getCreatedAt());
        resp.setGeneratedText(gc.getGeneratedText());
        resp.setDownloadUrl("/api/generated-contracts/" + gc.getId() + "/download");
        return resp;
    }

    private String toJsonSafe(Map<String, String> fields) {
        try {
            return objectMapper.writeValueAsString(fields);
        } catch (Exception e) {
            throw new RuntimeException("Error serializing fields to JSON", e);
        }
    }

    private String buildDummyContractText(String templateCode, Map<String, String> fields) {
        StringBuilder sb = new StringBuilder();
        sb.append("CONTRATO GENERADO (dummy)\n\n");
        sb.append("Plantilla: ").append(templateCode).append("\n\n");
        sb.append("Datos rellenados:\n");
        fields.forEach((k, v) -> sb.append("- ").append(k).append(": ").append(v).append("\n"));
        sb.append("\nTexto legal real pendiente de generación por IA.\n");
        return sb.toString();
    }

}
