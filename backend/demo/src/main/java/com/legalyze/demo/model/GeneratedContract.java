package com.legalyze.demo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "generated_contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Por ahora guardamos solo el código de plantilla
    // Más adelante puedes añadir @ManyToOne ContractTemplate y/o User.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String templateCode;

    @Column(nullable = false)
    private String templateName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String filledDataJson;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String generatedText;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String generatedHtml;

    private LocalDateTime expiresAt;

    private String pdfPath;

    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

}
