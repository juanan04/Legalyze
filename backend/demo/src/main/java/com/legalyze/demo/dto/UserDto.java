package com.legalyze.demo.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String profileImage;
    private Integer credits;
    private Integer freeTrialsRemaining;
    private Boolean freeAnalysisUsed; // Deprecated
    private Boolean emailVerified;
    private Boolean betaNoticeAck;
}
