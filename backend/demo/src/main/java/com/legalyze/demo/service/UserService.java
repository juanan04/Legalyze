package com.legalyze.demo.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;

import com.legalyze.demo.dto.UserProfileDto;
import com.legalyze.demo.model.User;
import com.legalyze.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User) {
            return (User) principal;
        }
        // Fallback or throw exception if not authenticated
        // For now, if not authenticated, we might want to throw exception
        // But for development/testing if we don't have token, maybe we still want the
        // old behavior?
        // No, let's enforce authentication.
        return userRepository.findByEmail(principal.toString())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    public UserProfileDto getProfile() {
        User u = getCurrentUser();
        UserProfileDto dto = new UserProfileDto();
        dto.setId(u.getId());
        dto.setName(u.getName());
        dto.setEmail(u.getEmail());
        dto.setProfileImage(u.getProfileImage());
        dto.setCreatedAt(u.getCreatedAt());
        dto.setCredits(u.getCredits());
        dto.setFreeAnalysisUsed(u.getFreeAnalysisUsed());
        dto.setEmailVerified(u.getEmailVerified());
        return dto;
    }

    public UserProfileDto updateProfile(String name, String email, String profileImage) {
        User u = getCurrentUser();
        u.setName(name);

        if (!u.getEmail().equals(email)) {
            u.setEmail(email);
            u.setEmailVerified(false);
            u.setVerificationToken(java.util.UUID.randomUUID().toString());
            u.setVerificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
            // TODO: Send verification email to new address?
            // For now, we just reset it. The user might need to request a new email
            // manually or we trigger it here.
        }

        if (profileImage != null) {
            u.setProfileImage(profileImage);
        }
        userRepository.save(u);
        return getProfile();
    }

    public void changePassword(String oldPassword, String newPassword) {
        User u = getCurrentUser();

        if (!passwordEncoder.matches(oldPassword, u.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        u.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(u);
    }

    public void validateUserAccess() {
        User u = getCurrentUser();
        if (!Boolean.TRUE.equals(u.getEmailVerified())) {
            throw new IllegalStateException("EMAIL_NOT_VERIFIED");
        }
    }

    public void consumeAnalysisCredit() {
        validateUserAccess();
        User u = getCurrentUser();

        if (!u.getFreeAnalysisUsed()) {
            u.setFreeAnalysisUsed(true);
        } else {
            if (u.getCredits() > 0) {
                u.setCredits(u.getCredits() - 1);
            } else {
                throw new IllegalStateException("NO_CREDITS");
            }
        }
        userRepository.save(u);
    }

}
