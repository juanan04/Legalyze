package com.legalyze.demo.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
        com.legalyze.demo.model.User currentUser = userService.getCurrentUser();

        // Enforce history limit (max 30)
        long count = generatedContractRepository.countByUser(currentUser);
        if (count >= 30) {
            GeneratedContract oldest = generatedContractRepository.findFirstByUserOrderByCreatedAtAsc(currentUser);
            if (oldest != null) {
                generatedContractRepository.delete(oldest);
            }
        }

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
                .generatedText(generatedText)
                .pdfPath(null) // lo rellenaremos cuando generemos el PDF de verdad
                .user(currentUser)
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

    public Page<GeneratedContractListItemDto> listAll(Pageable pageable) {
        com.legalyze.demo.model.User currentUser = userService.getCurrentUser();
        return generatedContractRepository.findAllByUserOrderByCreatedAtDesc(currentUser, pageable)
                .map(gc -> {
                    GeneratedContractListItemDto dto = new GeneratedContractListItemDto();
                    dto.setId(gc.getId());
                    dto.setTemplateCode(gc.getTemplateCode());
                    dto.setTemplateName(gc.getTemplateName());
                    dto.setCreatedAt(gc.getCreatedAt());
                    return dto;
                });
    }

    public GenerateContractResponse getById(Long id) {
        com.legalyze.demo.model.User currentUser = userService.getCurrentUser();
        GeneratedContract gc = generatedContractRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Generated contract not found with id " + id));

        if (gc.getUser() != null && !gc.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

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
