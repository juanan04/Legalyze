package com.legalyze.demo.api;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.legalyze.demo.dto.GenerateContractRequest;
import com.legalyze.demo.dto.GenerateContractResponse;
import com.legalyze.demo.dto.GeneratedContractListItemDto;
import com.legalyze.demo.service.GeneratedContractService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/generated-contracts")
@RequiredArgsConstructor
@CrossOrigin
public class GeneratedContractController {

    private final GeneratedContractService generatedContractService;
    private final com.legalyze.demo.service.AiContractGenerationService aiContractGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<GenerateContractResponse> generate(@RequestBody GenerateContractRequest request) {
        return ResponseEntity.ok(generatedContractService.generate(request));
    }

    @PostMapping("/ai")
    public ResponseEntity<com.legalyze.demo.dto.GenerateAiContractResponse> generateAi(
            @RequestBody com.legalyze.demo.dto.GenerateAiContractRequest request) {
        return ResponseEntity.ok(aiContractGenerationService.generate(request));
    }

    @GetMapping
    public ResponseEntity<Page<GeneratedContractListItemDto>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(generatedContractService.listAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GenerateContractResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(generatedContractService.getById(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        byte[] docxBytes = aiContractGenerationService.downloadDocx(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
        headers.setContentDispositionFormData("attachment", "contrato-" + id + ".docx");

        return new ResponseEntity<>(docxBytes, headers, HttpStatus.OK);
    }

}
