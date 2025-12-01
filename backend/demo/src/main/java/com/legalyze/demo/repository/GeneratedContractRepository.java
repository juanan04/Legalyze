package com.legalyze.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.legalyze.demo.model.GeneratedContract;

public interface GeneratedContractRepository extends JpaRepository<GeneratedContract, Long> {

    List<GeneratedContract> findAllByOrderByCreatedAtDesc();
}
