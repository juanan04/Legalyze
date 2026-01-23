package com.legalyze.demo.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.legalyze.demo.config.RateLimitConfig;

class RateLimitingServiceTest {

    private RateLimitingService rateLimitingService;
    private RateLimitConfig config;

    @BeforeEach
    void setUp() {
        config = new RateLimitConfig();
        rateLimitingService = new RateLimitingService(config);
    }

    @Test
    void testTryConsume() {
        RateLimitConfig.Limit limit = new RateLimitConfig.Limit(5, 60);
        String key = "test-key";

        // Consume 5 tokens
        for (int i = 0; i < 5; i++) {
            assertTrue(rateLimitingService.tryConsume(key, limit), "Request " + i + " should be allowed");
        }

        // 6th request should fail
        assertFalse(rateLimitingService.tryConsume(key, limit), "Request 6 should be blocked");
    }
}
