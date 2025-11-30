package com.legalyze.demo.dto;

import lombok.Data;

@Data
public class FieldSchemaDto {
    private String name;
    private String label;
    private String type;
    private boolean required;
}
