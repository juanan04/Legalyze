package com.legalyze.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.legalyze.demo.model.ContractAnalysis;

public interface ContractAnalysisRepository extends JpaRepository<ContractAnalysis, Long> {

    List<ContractAnalysis> findAllByOrderByUploadedAtDesc();
}
