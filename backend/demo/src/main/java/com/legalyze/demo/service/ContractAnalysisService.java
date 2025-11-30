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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractAnalysisService {

    private final ContractAnalysisRepository contractAnalysisRepository;

    public ContractAnalysisResponse analyze(MultipartFile file) {
        // TODO: cuando haya seguridad, asociar a User. De momento, null en user.
        ContractAnalysis analysis = ContractAnalysis.builder()
                .originalFileName(file.getOriginalFilename())
                .uploadedAt(LocalDateTime.now())
                .status(AnalysisStatus.COMPLETED)
                .summary("Resumen corto del contrato (dummy)")
                .rawText(null)
                .keyClausesJson(null)
                .risksJson(null)
                .llmModelUsed("dummy-model")
                .errorMessage(null)
                .build();

        analysis = contractAnalysisRepository.save(analysis);

        // Construimos respuesta dummy
        ClauseDto clauseDto = new ClauseDto();
        clauseDto.setTitle("Duración del contrato");
        clauseDto.setDescription("El contrato tiene una duración de 12 meses (dummy).");
        clauseDto.setClauseText("Texto literal opcional...");
        clauseDto.setRiskLevel("LOW");

        RiskDto riskDto = new RiskDto();
        riskDto.setTitle("Clausula de penalización");
        riskDto.setDescription("Penalización de 3 mensualidades si se rompe antes (dummy)");
        riskDto.setSeverity("LOW");

        ContractAnalysisResponse resp = new ContractAnalysisResponse();
        resp.setId(analysis.getId());
        resp.setOriginalFileName(analysis.getOriginalFileName());
        resp.setUploadedAt(analysis.getUploadedAt());
        resp.setStatus(analysis.getStatus().name());
        resp.setSummary(analysis.getSummary());
        resp.setKeyClauses(List.of(clauseDto));
        resp.setRisks(List.of(riskDto));
        return resp;
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

        // Mismo dummy que analyze, pero usando datos del registro
        ClauseDto clause = new ClauseDto();
        clause.setTitle("Duración del contrato");
        clause.setDescription("El contrato tiene una duración de 12 meses (dummy).");
        clause.setClauseText("Texto literal opcional...");
        clause.setRiskLevel("LOW");

        RiskDto risk = new RiskDto();
        risk.setTitle("Cláusula de penalización");
        risk.setDescription("Penalización de 3 mensualidades si se rompe antes (dummy).");
        risk.setSeverity("HIGH");

        ContractAnalysisResponse resp = new ContractAnalysisResponse();
        resp.setId(a.getId());
        resp.setOriginalFileName(a.getOriginalFileName());
        resp.setUploadedAt(a.getUploadedAt());
        resp.setStatus(a.getStatus().name());
        resp.setSummary(a.getSummary());
        resp.setKeyClauses(List.of(clause));
        resp.setRisks(List.of(risk));
        return resp;
    }
}
