package com.legalyze.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.legalyze.demo.model.ContractAnalysis;

public interface ContractAnalysisRepository extends JpaRepository<ContractAnalysis, Long> {
    // Más adelante: métodos por usuarios, etc.
}
