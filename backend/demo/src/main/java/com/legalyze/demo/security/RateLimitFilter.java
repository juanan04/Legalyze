package com.legalyze.demo.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.legalyze.demo.config.RateLimitConfig;
import com.legalyze.demo.service.RateLimitingService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final RateLimitConfig rateLimitConfig;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = getClientIP(request);
        String userId = getUserId();

        // 1. Login
        if (path.startsWith("/api/auth/login")) {
            if (!checkLimit(response, "login:ip:" + ip, rateLimitConfig.getLogin())) {
                return;
            }
            // Note: Limiting by username/email requires reading the body, which is complex
            // in a filter
            // without wrapping the request. For MVP, we limit by IP.
        }

        // 2. Register
        else if (path.startsWith("/api/auth/register")) {
            if (!checkLimit(response, "register:ip:" + ip, rateLimitConfig.getRegister())) {
                return;
            }
        }

        // 3. AI Generation
        else if (path.startsWith("/api/generated-contracts/generate")) {
            // Limit by IP
            if (!checkLimit(response, "gen:ip:" + ip, rateLimitConfig.getGenerationIp())) {
                return;
            }
            // Limit by User (if authenticated)
            if (userId != null) {
                if (!checkLimit(response, "gen:user:" + userId, rateLimitConfig.getGenerationUser())) {
                    return;
                }
            }
        }

        // 4. AI Analysis
        else if (path.startsWith("/api/contracts/analyze")) {
            // Limit by IP
            if (!checkLimit(response, "analyze:ip:" + ip, rateLimitConfig.getAnalysisIp())) {
                return;
            }
            // Limit by User (if authenticated)
            if (userId != null) {
                if (!checkLimit(response, "analyze:user:" + userId, rateLimitConfig.getAnalysisUser())) {
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean checkLimit(HttpServletResponse response, String key, RateLimitConfig.Limit limit)
            throws IOException {
        if (!rateLimitingService.tryConsume(key, limit)) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(objectMapper.writeValueAsString(
                    new ErrorResponse("RATE_LIMITED", "Too many requests. Please try again later.")));
            log.warn("Rate limit blocked request: {}", key);
            return false;
        }
        return true;
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private String getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName(); // Returns username/email usually
        }
        return null;
    }

    record ErrorResponse(String error, String message) {
    }
}
