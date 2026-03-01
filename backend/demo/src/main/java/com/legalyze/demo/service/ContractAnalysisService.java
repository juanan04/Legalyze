package com.legalyze.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.legalyze.demo.dto.ContractAnalysisListItemDto;
import com.legalyze.demo.dto.ContractAnalysisResponse;
import com.legalyze.demo.model.AnalysisStatus;
import com.legalyze.demo.model.ContractAnalysis;
import com.legalyze.demo.model.User;
import com.legalyze.demo.repository.ContractAnalysisRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractAnalysisService {

    private final ContractAnalysisRepository contractAnalysisRepository;
    private final AIServiceFactory aiServiceFactory;
    private final UserService userService;
    private final DocumentService documentService;
    private final EmailService emailService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @Value("${ai.provider}")
    private String aiProvider;

    public ContractAnalysisResponse analyze(MultipartFile file) {
        // 0.1 Validate File Type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Invalid file type. Solo están permitidos archivos PDF.");
        }

        int pageCount = 1;
        try {
            pageCount = documentService.getPageCount(file);
        } catch (Exception e) {
            throw new RuntimeException("Error reading document format. Archivo dañado o ilegible.", e);
        }

        // Calculate credit cost
        int requiredCredits = 1;
        if (pageCount >= 16 && pageCount <= 50) {
            requiredCredits = 3;
        } else if (pageCount > 50) {
            requiredCredits = 5;
        }

        // 0. Check and consume credits
        User user = userService.getCurrentUser();
        if (user.getFreeTrialsRemaining() == 0 && user.getCredits() < requiredCredits) {
            throw new IllegalStateException(
                    "Payment Required: No tienes créditos suficientes. Coste: " + requiredCredits + " créditos.");
        }

        boolean usedFree = userService.consumeAnalysisCredit(requiredCredits);

        // Enforce history limit (max 30)
        long count = contractAnalysisRepository.countByUser(user);
        if (count >= 30) {
            ContractAnalysis oldest = contractAnalysisRepository.findFirstByUserOrderByUploadedAtAsc(user);
            if (oldest != null) {
                contractAnalysisRepository.delete(oldest);
            }
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
                    .contractType(aiResponse.getContractType())
                    .summary(aiResponse.getSummary())
                    .healthScore(aiResponse.getHealthScore())
                    .verdict(aiResponse.getVerdict())
                    .findingsSummaryJson(objectMapper.writeValueAsString(aiResponse.getFindingsSummary()))
                    .detailedAnalysisJson(objectMapper.writeValueAsString(aiResponse.getDetailedAnalysis()))
                    .llmModelUsed("GEMINI".equalsIgnoreCase(aiProvider) ? "gemini-1.5-flash" : "gpt-4o-mini")
                    .user(user)
                    .build();

            analysis = contractAnalysisRepository.save(analysis);

            // Notify admin
            try {
                String subject = "¡Nuevo Lead Evaluando Contrato!";
                String content = String.format(
                        "Aviso: <b>%s</b> de la agencia <b>%s</b> ha analizado un contrato. Salud Legal detectada: <b>%d%%</b>",
                        user.getName(), user.getAgencyName(), aiResponse.getHealthScore());
                emailService.sendAdminNotification(subject, content);
            } catch (Exception e) {
                // Ignore exception to not block flow
            }

            // 4. Return response with ID
            aiResponse.setId(analysis.getId());
            aiResponse.setOriginalFileName(analysis.getOriginalFileName());
            aiResponse.setUploadedAt(analysis.getUploadedAt());
            aiResponse.setStatus(analysis.getStatus().name());

            return aiResponse;

        } catch (Exception e) {
            userService.refundAnalysisCredit(usedFree, requiredCredits);
            throw new RuntimeException("Error analyzing contract", e);
        }
    }

    public com.legalyze.demo.dto.ContractPreviewResponse preview(MultipartFile file) {
        return documentService.generatePreview(file);
    }

    public Page<ContractAnalysisListItemDto> listAll(Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        return contractAnalysisRepository.findAllByUserOrderByUploadedAtDesc(currentUser, pageable)
                .map(a -> {
                    ContractAnalysisListItemDto dto = new ContractAnalysisListItemDto();
                    dto.setId(a.getId());
                    dto.setOriginalFileName(a.getOriginalFileName());
                    dto.setUploadedAt(a.getUploadedAt());
                    dto.setStatus(a.getStatus().name());
                    dto.setSummary(a.getSummary());
                    return dto;
                });
    }

    public ContractAnalysisResponse getById(Long id) {
        User currentUser = userService.getCurrentUser();
        ContractAnalysis a = contractAnalysisRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Analysis not found: " + id));

        if (a.getUser() != null && !a.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        ContractAnalysisResponse resp = new ContractAnalysisResponse();
        resp.setId(a.getId());
        resp.setOriginalFileName(a.getOriginalFileName());
        resp.setUploadedAt(a.getUploadedAt());
        resp.setStatus(a.getStatus().name());
        resp.setContractType(a.getContractType());
        resp.setSummary(a.getSummary());
        resp.setHealthScore(a.getHealthScore());
        resp.setVerdict(a.getVerdict());

        try {
            if (a.getFindingsSummaryJson() != null) {
                List<String> findings = objectMapper.readValue(
                        a.getFindingsSummaryJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                resp.setFindingsSummary(findings);
            }
            if (a.getDetailedAnalysisJson() != null) {
                List<com.legalyze.demo.dto.DetailedAnalysisDto> details = objectMapper.readValue(
                        a.getDetailedAnalysisJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class,
                                com.legalyze.demo.dto.DetailedAnalysisDto.class));
                resp.setDetailedAnalysis(details);
            }
        } catch (Exception e) {
            // Log error but return what we have
            e.printStackTrace();
        }

        return resp;
    }
}
