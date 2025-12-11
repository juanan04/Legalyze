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

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String verificationToken = java.util.UUID.randomUUID().toString();
        System.out.println("DEBUG: Generated token for " + request.getEmail() + ": [" + verificationToken + "]"); // Debug
                                                                                                                  // log

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .credits(0)
                .freeAnalysisUsed(false)
                .emailVerified(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24))
                .build();

        user = userRepository.save(user);
        System.out.println("DEBUG: User saved with ID: " + user.getId()); // Debug log

        // Send verification email
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        String token = jwtService.generateToken(user);

        RegisterResponse resp = new RegisterResponse();
        resp.setId(user.getId());
        resp.setName(user.getName());
        resp.setEmail(user.getEmail());
        resp.setToken(token);
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);

        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setName(user.getName());
        userDto.setEmail(user.getEmail());
        userDto.setProfileImage(user.getProfileImage());
        userDto.setCredits(user.getCredits());
        userDto.setFreeAnalysisUsed(user.getFreeAnalysisUsed());
        userDto.setEmailVerified(user.getEmailVerified());

        LoginResponse resp = new LoginResponse();
        resp.setToken(token);
        resp.setUser(userDto);

        return resp;
    }

    public void verifyEmail(String token) {
        System.out.println("DEBUG: Verifying email with token: [" + token + "]");
        System.out.println("DEBUG: Token length: " + (token != null ? token.length() : "null"));

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: Token NOT found in DB: [" + token + "]");
                    // Try to list all tokens to see if there's a mismatch (ONLY FOR DEBUGGING)
                    userRepository.findAll().forEach(u -> {
                        if (u.getVerificationToken() != null) {
                            System.out.println("DEBUG: Existing token in DB: [" + u.getVerificationToken()
                                    + "] for user " + u.getEmail());
                        }
                    });
                    return new IllegalArgumentException("Invalid verification token");
                });

        System.out.println("DEBUG: Token found for user: " + user.getEmail());

        if (user.getVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        System.out.println("DEBUG: User verified and saved.");
    }
}
