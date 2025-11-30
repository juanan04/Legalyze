package com.legalyze.demo.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contract_template")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code; // RENT_SPAIN_BASIC

    @Column(name = "name", nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, length = 5)
    private String language; // es, en, fr, de

    @Lob
    @Column(columnDefinition = "TEXT")
    private String schemaJson; // JSON con definición de campos

    @Lob
    @Column(columnDefinition = "TEXT")
    private String templateText; // Plantilla con placeholders

}
