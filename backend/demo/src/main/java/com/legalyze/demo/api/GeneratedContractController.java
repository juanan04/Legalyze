package com.legalyze.demo.api;

import java.nio.charset.StandardCharsets;
import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping("/generate")
    public ResponseEntity<GenerateContractResponse> generate(@RequestBody GenerateContractRequest request) {
        return ResponseEntity.ok(generatedContractService.generate(request));
    }

    @GetMapping
    public ResponseEntity<List<GeneratedContractListItemDto>> listAll() {
        return ResponseEntity.ok(generatedContractService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GenerateContractResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(generatedContractService.getById(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        // MVP: devolvemos el texto en un "pseudo-PDF" como .txt.
        // Más adelante lo cambiaremos por un PDF real.
        GenerateContractResponse contract = generatedContractService.getById(id);

        String content = contract.getGeneratedText();
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData(
                "attachment",
                "contrato-" + id + ".txt");

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

}
