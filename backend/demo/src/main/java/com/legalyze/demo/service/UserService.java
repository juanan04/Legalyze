package com.legalyze.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.legalyze.demo.dto.UserProfileDto;
import com.legalyze.demo.model.User;
import com.legalyze.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // TODO: cuando tenga JWT real, esto leerá el userId del token
    private User getCurrentUser() {
        return userRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No users found"));
    }

    public UserProfileDto getProfile() {
        User u = getCurrentUser();
        UserProfileDto dto = new UserProfileDto();
        dto.setId(u.getId());
        dto.setName(u.getName());
        dto.setEmail(u.getEmail());
        dto.setProfileImage(u.getProfileImage());
        dto.setCreatedAt(u.getCreatedAt());
        return dto;
    }

    public UserProfileDto updateProfile(String name, String email, String profileImage) {
        User u = getCurrentUser();
        u.setName(name);
        u.setEmail(email);
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

}
