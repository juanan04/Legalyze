package com.legalyze.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.legalyze.demo.dto.TemplateDetailDto;
import com.legalyze.demo.dto.TemplateListItemDto;
import com.legalyze.demo.dto.TemplateSchema;
import com.legalyze.demo.model.ContractTemplate;
import com.legalyze.demo.repository.ContractTemplateRepository;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final ContractTemplateRepository contractTemplateRepository;
    private final ObjectMapper objectMapper;

    public List<TemplateListItemDto> listAll() {
        return contractTemplateRepository.findAll()
                .stream()
                .map(t -> {
                    TemplateListItemDto dto = new TemplateListItemDto();
                    dto.setCode(t.getCode());
                    dto.setName(t.getName());
                    dto.setDescription(t.getDescription());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public TemplateDetailDto getByCode(String code) {
        ContractTemplate t = contractTemplateRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + code));

        TemplateDetailDto dto = new TemplateDetailDto();
        dto.setCode(t.getCode());
        dto.setName(t.getName());
        dto.setDescription(t.getDescription());
        dto.setLanguage(t.getLanguage());

        try {
            // schemaJson: {"fields":[{...}]}
            TemplateSchema schema = objectMapper.readValue(t.getSchemaJson(), TemplateSchema.class);
            dto.setFields(schema.getFields());
        } catch (Exception e) {
            throw new RuntimeException("Invalid schemaJson for template " + code, e);
        }

        return dto;
    }
}
