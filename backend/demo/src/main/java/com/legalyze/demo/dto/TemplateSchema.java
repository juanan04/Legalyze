package com.legalyze.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class TemplateSchema {
    private List<FieldSchemaDto> fields;
}
