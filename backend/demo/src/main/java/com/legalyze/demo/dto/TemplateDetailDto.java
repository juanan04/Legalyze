package com.legalyze.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class TemplateDetailDto {
    private String code;
    private String name;
    private String description;
    private String language;
    private List<FieldSchemaDto> fields;
}
