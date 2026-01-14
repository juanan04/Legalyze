package com.legalyze.demo.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cuando tegas seguridad/JWT real, aquí iría @ManyToOne User
    // De momento podemos dejarlo null o añadir luego
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String originalFileName;

    private String storedFilePath;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AnalysisStatus status;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String rawText;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String keyClausesJson;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String risksJson;

    private String llmModelUsed;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @PrePersist
    void prePersist() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = AnalysisStatus.PENDING;
        }
    }
}
