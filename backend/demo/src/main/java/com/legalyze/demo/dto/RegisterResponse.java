package com.legalyze.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RegisterResponse {
    private Long id;
    private String name;
    private String email;
    private String token;
    private Integer freeTrialsRemaining;
    private LocalDateTime createdAt;
}
