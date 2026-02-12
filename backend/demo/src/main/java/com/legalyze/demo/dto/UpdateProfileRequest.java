package com.legalyze.demo.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String profileImage;
}
