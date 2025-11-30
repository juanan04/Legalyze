package com.legalyze.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.legalyze.demo.dto.TemplateListItemDto;
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
}
