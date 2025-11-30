package com.legalyze.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}
