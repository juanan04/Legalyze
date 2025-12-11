package com.legalyze.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.legalyze.demo.dto.ClauseDto;
import com.legalyze.demo.dto.ContractAnalysisListItemDto;
import com.legalyze.demo.dto.ContractAnalysisResponse;
import com.legalyze.demo.dto.RiskDto;
import com.legalyze.demo.model.AnalysisStatus;
import com.legalyze.demo.model.ContractAnalysis;
import com.legalyze.demo.repository.ContractAnalysisRepository;
import com.legalyze.demo.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractAnalysisService {

    private final ContractAnalysisRepository contractAnalysisRepository;
    private final OpenAIService openAIService;
    private final UserService userService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public ContractAnalysisResponse analyze(MultipartFile file) {
        // 0. Check and consume credits
        userService.consumeAnalysisCredit();

        // 1. Analyze with OpenAI
        ContractAnalysisResponse aiResponse = openAIService.analyzeContract(file);

        // 2. Save to DB
        try {
            ContractAnalysis analysis = ContractAnalysis.builder()
                    .originalFileName(file.getOriginalFilename())
                    .uploadedAt(LocalDateTime.now())
                    .status(AnalysisStatus.COMPLETED)
                    .summary(aiResponse.getSummary())
                    .keyClausesJson(objectMapper.writeValueAsString(aiResponse.getKeyClauses()))
                    .risksJson(objectMapper.writeValueAsString(aiResponse.getRisks()))
                    .llmModelUsed("gpt-4o")
                    .build();

            analysis = contractAnalysisRepository.save(analysis);

            // 3. Return response with ID
            aiResponse.setId(analysis.getId());
            aiResponse.setOriginalFileName(analysis.getOriginalFileName());
            aiResponse.setUploadedAt(analysis.getUploadedAt());
            aiResponse.setStatus(analysis.getStatus().name());

            return aiResponse;

        } catch (Exception e) {
            throw new RuntimeException("Error saving analysis", e);
        }
    }

    public List<ContractAnalysisListItemDto> listAll() {
        return contractAnalysisRepository.findAllByOrderByUploadedAtDesc()
                .stream()
                .map(a -> {
                    ContractAnalysisListItemDto dto = new ContractAnalysisListItemDto();
                    dto.setId(a.getId());
                    dto.setOriginalFileName(a.getOriginalFileName());
                    dto.setUploadedAt(a.getUploadedAt());
                    dto.setStatus(a.getStatus().name());
                    dto.setSummary(a.getSummary());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public ContractAnalysisResponse getById(Long id) {
        ContractAnalysis a = contractAnalysisRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Analysis not found: " + id));

        ContractAnalysisResponse resp = new ContractAnalysisResponse();
        resp.setId(a.getId());
        resp.setOriginalFileName(a.getOriginalFileName());
        resp.setUploadedAt(a.getUploadedAt());
        resp.setStatus(a.getStatus().name());
        resp.setSummary(a.getSummary());

        try {
            if (a.getKeyClausesJson() != null) {
                List<ClauseDto> clauses = objectMapper.readValue(
                        a.getKeyClausesJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, ClauseDto.class));
                resp.setKeyClauses(clauses);
            }
            if (a.getRisksJson() != null) {
                List<RiskDto> risks = objectMapper.readValue(
                        a.getRisksJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, RiskDto.class));
                resp.setRisks(risks);
            }
        } catch (Exception e) {
            // Log error but return what we have
            e.printStackTrace();
        }

        return resp;
    }
}
