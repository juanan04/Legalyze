package com.legalyze.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String profileImage;
    private LocalDateTime createdAt;
    private Integer credits;
    private Integer freeTrialsRemaining;
    private Boolean freeAnalysisUsed; // Deprecated, kept for compatibility if needed
    private Boolean emailVerified;
}
