package com.legalyze.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.legalyze.demo.model.GeneratedContract;

public interface GeneratedContractRepository extends JpaRepository<GeneratedContract, Long> {

    List<GeneratedContract> findAllByOrderByCreatedAtDesc();

    List<GeneratedContract> findAllByUserOrderByCreatedAtDesc(com.legalyze.demo.model.User user);

    org.springframework.data.domain.Page<GeneratedContract> findAllByUserOrderByCreatedAtDesc(
            com.legalyze.demo.model.User user, org.springframework.data.domain.Pageable pageable);

    long countByUser(com.legalyze.demo.model.User user);

    GeneratedContract findFirstByUserOrderByCreatedAtAsc(com.legalyze.demo.model.User user);

    List<GeneratedContract> findByExpiresAtBefore(java.time.LocalDateTime now);
}
