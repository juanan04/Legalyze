package com.legalyze.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.legalyze.demo.dto.LoginRequest;
import com.legalyze.demo.dto.LoginResponse;
import com.legalyze.demo.dto.RegisterRequest;
import com.legalyze.demo.dto.RegisterResponse;
import com.legalyze.demo.dto.UserDto;
import com.legalyze.demo.model.User;
import com.legalyze.demo.model.UserRole;
import com.legalyze.demo.repository.UserRepository;
import com.legalyze.demo.security.JwtService;

import lombok.RequiredArgsConstructor;

import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Log4j2
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    private final java.util.Set<String> DISPOSABLE_DOMAINS = java.util.Set.of(
            "yopmail.com", "tempmail.com", "guerrillamail.com", "10minutemail.com", "mailinator.com");

    private boolean isDisposableEmail(String email) {
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        return DISPOSABLE_DOMAINS.contains(domain);
    }

    public RegisterResponse register(RegisterRequest request) {
        if (isDisposableEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email domain not allowed. Please use a work or personal email.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            // Check if suspended
            User existing = userRepository.findByEmail(request.getEmail()).get();
            if (Boolean.TRUE.equals(existing.getIsSuspended())) {
                throw new IllegalArgumentException(
                        "Esta cuenta ha sido suspendida/eliminada. No se puede volver a registrar con este correo.");
            }
            throw new IllegalArgumentException("El correo electrónico ya está registrado.");
        }

        String verificationToken = java.util.UUID.randomUUID().toString();
        log.debug("Generated token for {}: [{}]", request.getEmail(), verificationToken);

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .credits(0)
                .freeTrialsRemaining(3)
                .freeAnalysisUsed(false)
                .emailVerified(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24))
                .build();

        user = userRepository.save(user);
        log.debug("User saved with ID: {}", user.getId());

        // Send verification email
        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
        }

        String token = jwtService.generateToken(user);

        RegisterResponse resp = new RegisterResponse();
        resp.setId(user.getId());
        resp.setName(user.getName());
        resp.setEmail(user.getEmail());
        resp.setToken(token);
        resp.setFreeTrialsRemaining(user.getFreeTrialsRemaining());
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Correo electrónico o contraseña incorrectos."));

        if (Boolean.TRUE.equals(user.getIsSuspended())) {
            throw new IllegalArgumentException(
                    "Tu cuenta ha sido eliminada. Contacta con soporte si crees que es un error.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Correo electrónico o contraseña incorrectos.");
        }

        long expiration = request.isRememberMe() ? 2505600000L : 18000000L; // 29 days vs 5 hours
        String token = jwtService.generateToken(user, expiration);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setProfileImage(user.getProfileImage());
        userDto.setCredits(user.getCredits());
        userDto.setFreeTrialsRemaining(user.getFreeTrialsRemaining());
        userDto.setFreeAnalysisUsed(user.getFreeAnalysisUsed());
        userDto.setEmailVerified(user.getEmailVerified());
        userDto.setBetaNoticeAck(user.getBetaNoticeAck());

        LoginResponse resp = new LoginResponse();
        resp.setToken(token);
        resp.setUser(userDto);

        return resp;
    }

    public void verifyEmail(String token) {
        log.debug("Verifying email with token: [{}]", token);
        log.debug("Token length: {}", (token != null ? token.length() : "null"));

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> {
                    log.debug("Token NOT found in DB: [{}]", token);
                    // Try to list all tokens to see if there's a mismatch (ONLY FOR DEBUGGING)
                    userRepository.findAll().forEach(u -> {
                        if (u.getVerificationToken() != null) {
                            log.debug("Existing token in DB: [{}] for user {}", u.getVerificationToken(), u.getEmail());
                        }
                    });
                    return new IllegalArgumentException("Invalid verification token");
                });

        log.debug("Token found for user: {}", user.getEmail());

        if (user.getVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        log.info("User verified and saved.");
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Email already verified");
        }

        // Reuse existing token if valid, otherwise generate new one
        String token = user.getVerificationToken();
        if (token == null || user.getVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            token = java.util.UUID.randomUUID().toString();
            user.setVerificationToken(token);
            user.setVerificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
            userRepository.save(user);
        }

        emailService.sendVerificationEmail(user.getEmail(), token);
    }
}
