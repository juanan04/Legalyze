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
import com.legalyze.demo.model.User;
import com.legalyze.demo.repository.ContractAnalysisRepository;
import com.legalyze.demo.service.UserService;
import com.legalyze.demo.service.DocumentService;
import com.legalyze.demo.service.AIService;
import com.legalyze.demo.service.AIServiceFactory;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractAnalysisService {

    private final ContractAnalysisRepository contractAnalysisRepository;
    private final AIServiceFactory aiServiceFactory;
    private final UserService userService;
    private final DocumentService documentService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public ContractAnalysisResponse analyze(MultipartFile file) {
        // 0. Check and consume credits
        User user = userService.getCurrentUser();
        if (user.getCredits() <= 0 && !user.getFreeAnalysisUsed()) {
            // Allow if it's the first free analysis (logic might need adjustment based on
            // requirements)
            // For now assuming free analysis is handled via credits or specific flag
        }

        userService.consumeAnalysisCredit();

        // 0.1 Validate File Type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf")
                && !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new IllegalArgumentException("Invalid file type. Only PDF and DOCX are allowed.");
        }

        try {
            // 1. Extract Text
            String text = documentService.extractTextFromPdf(file);

            // 2. Analyze with AI (Router)
            AIService aiService = aiServiceFactory.getService();
            ContractAnalysisResponse aiResponse = aiService.analyze(text);

            // 3. Save to DB
            ContractAnalysis analysis = ContractAnalysis.builder()
                    .originalFileName(file.getOriginalFilename())
                    .uploadedAt(LocalDateTime.now())
                    .status(AnalysisStatus.COMPLETED)
                    .summary(aiResponse.getSummary())
                    .keyClausesJson(objectMapper.writeValueAsString(aiResponse.getKeyClauses()))
                    .risksJson(objectMapper.writeValueAsString(aiResponse.getRisks()))
                    .llmModelUsed("gpt-4o-mini") // TODO: Update this based on provider
                    .build();

            analysis = contractAnalysisRepository.save(analysis);

            // 4. Return response with ID
            aiResponse.setId(analysis.getId());
            aiResponse.setOriginalFileName(analysis.getOriginalFileName());
            aiResponse.setUploadedAt(analysis.getUploadedAt());
            aiResponse.setStatus(analysis.getStatus().name());

            return aiResponse;

        } catch (Exception e) {
            throw new RuntimeException("Error analyzing contract", e);
        }
    }

    public com.legalyze.demo.dto.ContractPreviewResponse preview(MultipartFile file) {
        return documentService.generatePreview(file);
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
