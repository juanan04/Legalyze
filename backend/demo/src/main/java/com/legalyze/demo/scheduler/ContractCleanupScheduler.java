package com.legalyze.demo.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.legalyze.demo.model.GeneratedContract;
import com.legalyze.demo.repository.GeneratedContractRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContractCleanupScheduler {

    private final GeneratedContractRepository generatedContractRepository;

    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    @Transactional
    public void cleanupExpiredContracts() {
        log.info("Starting expired contract cleanup...");
        LocalDateTime now = LocalDateTime.now();
        List<GeneratedContract> expired = generatedContractRepository.findByExpiresAtBefore(now);

        if (!expired.isEmpty()) {
            generatedContractRepository.deleteAll(expired);
            log.info("Deleted {} expired contracts.", expired.size());
        } else {
            log.info("No expired contracts found.");
        }
    }
}
