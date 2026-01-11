package com.legalyze.demo.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.legalyze.demo.dto.ContractAnalysisListItemDto;
import com.legalyze.demo.dto.ContractAnalysisResponse;
import com.legalyze.demo.service.ContractAnalysisService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@CrossOrigin
public class ContractAnalysisController {

    private final ContractAnalysisService contractAnalysisService;

    @PostMapping("/analyze")
    public ResponseEntity<ContractAnalysisResponse> analyze(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(contractAnalysisService.analyze(file));
    }

    @PostMapping("/preview")
    public ResponseEntity<com.legalyze.demo.dto.ContractPreviewResponse> preview(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(contractAnalysisService.preview(file));
    }

    @GetMapping("/analysis")
    public ResponseEntity<List<ContractAnalysisListItemDto>> listAll() {
        return ResponseEntity.ok(contractAnalysisService.listAll());
    }

    @GetMapping("/analysis/{id}")
    public ResponseEntity<ContractAnalysisResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contractAnalysisService.getById(id));
    }

}
