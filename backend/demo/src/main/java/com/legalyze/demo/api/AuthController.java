package com.legalyze.demo.api;

import com.legalyze.demo.dto.LoginRequest;
import com.legalyze.demo.dto.LoginResponse;
import com.legalyze.demo.dto.RegisterRequest;
import com.legalyze.demo.dto.RegisterResponse;
import com.legalyze.demo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verify(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            // Fallback: In a real app, we might get email from SecurityContext if logged in
            // For now, we require email in body or we could extract from token if passed
            return ResponseEntity.badRequest().body("Email is required");
        }
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok("Verification email resent");
    }

}
