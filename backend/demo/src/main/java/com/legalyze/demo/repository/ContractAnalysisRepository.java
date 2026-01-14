package com.legalyze.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.legalyze.demo.model.ContractAnalysis;

public interface ContractAnalysisRepository extends JpaRepository<ContractAnalysis, Long> {

    List<ContractAnalysis> findAllByOrderByUploadedAtDesc();

    List<ContractAnalysis> findAllByUserOrderByUploadedAtDesc(com.legalyze.demo.model.User user);

    org.springframework.data.domain.Page<ContractAnalysis> findAllByUserOrderByUploadedAtDesc(
            com.legalyze.demo.model.User user, org.springframework.data.domain.Pageable pageable);

    long countByUser(com.legalyze.demo.model.User user);

    ContractAnalysis findFirstByUserOrderByUploadedAtAsc(com.legalyze.demo.model.User user);
}
