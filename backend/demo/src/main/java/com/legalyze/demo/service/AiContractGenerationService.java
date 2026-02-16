package com.legalyze.demo.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.legalyze.demo.dto.GenerateAiContractRequest;
import com.legalyze.demo.dto.GenerateAiContractResponse;
import com.legalyze.demo.model.GeneratedContract;
import com.legalyze.demo.model.User;
import com.legalyze.demo.repository.ContractTemplateRepository;
import com.legalyze.demo.repository.GeneratedContractRepository;
import com.legalyze.demo.repository.UserRepository;
import com.legalyze.demo.service.ai.AiContractGenerator;
import com.legalyze.demo.service.ai.AiContractGeneratorFactory;
import com.legalyze.demo.service.ai.AiContractResult;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiContractGenerationService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final GeneratedContractRepository generatedContractRepository;
    private final ContractTemplateRepository contractTemplateRepository;
    private final AiContractGeneratorFactory aiGeneratorFactory;
    private final HtmlToDocxService htmlToDocxService;
    private final ObjectMapper objectMapper;

    // Removed @Transactional to allow manual credit management and avoid long db
    // lock during AI call
    public GenerateAiContractResponse generate(GenerateAiContractRequest request) {
        User user = userService.getCurrentUser();
        boolean usedFree = false;

        if (Boolean.TRUE.equals(user.getIsSuspended())) {
            throw new RuntimeException("User is suspended"); // Controller should map to 403
        }

        // Validate template exists (Optional for now as per user request)
        var templateOpt = contractTemplateRepository.findByCode(request.getTemplateCode());

        // Billing Logic
        if (user.getFreeTrialsRemaining() > 0) {
            user.setFreeTrialsRemaining(user.getFreeTrialsRemaining() - 1);
            usedFree = true;
        } else if (user.getCredits() >= 2) {
            user.setCredits(user.getCredits() - 2);
        } else {
            throw new RuntimeException("INSUFFICIENT_CREDITS"); // Controller should map to 402
        }
        userRepository.save(user);

        try {
            // Generate Content
            AiContractGenerator generator = aiGeneratorFactory.getGenerator();
            AiContractResult result = generator.generate(request);

            // Persist
            String filledDataJson = "{}";
            try {
                filledDataJson = objectMapper.writeValueAsString(request.getFields());
            } catch (Exception e) {
                // ignore
            }

            String templateName = templateOpt.map(t -> t.getName()).orElse(request.getTemplateCode());

            GeneratedContract contract = GeneratedContract.builder()
                    .user(user)
                    .templateCode(request.getTemplateCode())
                    .templateName(templateName)
                    .filledDataJson(filledDataJson)
                    .generatedText(result.getText())
                    .generatedHtml(result.getHtml())
                    .createdAt(LocalDateTime.now())
                    .expiresAt(LocalDateTime.now().plusHours(48))
                    .build();

            GeneratedContract saved = generatedContractRepository.save(contract);

            return GenerateAiContractResponse.builder()
                    .id(saved.getId())
                    .templateCode(saved.getTemplateCode())
                    .generatedText(saved.getGeneratedText())
                    .generatedHtml(saved.getGeneratedHtml())
                    .downloadUrl("/api/generated-contracts/" + saved.getId() + "/download")
                    .expiresAt(saved.getExpiresAt().atZone(java.time.ZoneId.systemDefault()).toInstant())
                    .build();

        } catch (Exception e) {
            userService.refundGenerationCredit(usedFree);
            throw new RuntimeException("Error generating contract", e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] downloadDocx(Long id) {
        User user = userService.getCurrentUser();
        GeneratedContract contract = generatedContractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (!contract.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (contract.getExpiresAt() != null && contract.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("GONE"); // Controller should map to 410
        }

        return htmlToDocxService.convert(contract.getGeneratedHtml());
    }
}
