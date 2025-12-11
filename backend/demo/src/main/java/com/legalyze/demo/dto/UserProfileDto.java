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
    private Boolean freeAnalysisUsed;
    private Boolean emailVerified;
}
