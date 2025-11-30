package com.legalyze.demo.repository;

import com.legalyze.demo.model.ContractTemplate;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractTemplateRepository extends JpaRepository<ContractTemplate, Long> {
    Optional<ContractTemplate> findByCode(String code);
}
