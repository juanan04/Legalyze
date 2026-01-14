package com.legalyze.demo.api;

import com.legalyze.demo.service.AuthService;
import com.legalyze.demo.dto.RegisterRequest;
import com.legalyze.demo.dto.RegisterResponse;
import com.legalyze.demo.dto.LoginRequest;
import com.legalyze.demo.dto.LoginResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<RegisterResponse> register(@RequestBody @Valid RegisterRequest request,
            HttpServletResponse response) {
        RegisterResponse regResponse = authService.register(request);
        setJwtCookie(response, regResponse.getToken());
        regResponse.setToken(null); // Don't send token in body
        return ResponseEntity.ok(regResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request, HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        setJwtCookie(response, loginResponse.getToken());
        loginResponse.setToken(null); // Don't send token in body
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to false for localhost development
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
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
            return ResponseEntity.badRequest().body("Email is required");
        }
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok("Verification email resent");
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to false for localhost development
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 1 day, matches default JWT expiration
        response.addCookie(cookie);
    }

}
