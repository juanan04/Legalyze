package com.legalyze.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClauseSelectionDto {
    private String key;
    private boolean enabled;
    private String description;
}
