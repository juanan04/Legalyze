package com.legalyze.demo.model;

import java.time.LocalDateTime;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Builder.Default
    @Column(nullable = false)
    private Integer credits = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isSuspended = false;

    @Builder.Default
    @Column(nullable = false)
    private Integer freeTrialsRemaining = 3;

    @Deprecated
    @Builder.Default
    @Column(nullable = false)
    private Boolean freeAnalysisUsed = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean emailVerified = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean betaNoticeAck = false;

    @Column(length = 64)
    private String verificationToken;

    private LocalDateTime verificationTokenExpiry;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (role == null) {
            role = UserRole.USER;
        }
        if (credits == null) {
            credits = 0;
        }
        if (freeAnalysisUsed == null) {
            freeAnalysisUsed = false;
        }
        if (emailVerified == null) {
            emailVerified = false;
        }
        if (betaNoticeAck == null) {
            betaNoticeAck = false;
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
