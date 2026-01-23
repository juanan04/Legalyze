package com.legalyze.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "app.rate-limit")
@Data
public class RateLimitConfig {

    private boolean enabled = true;

    // Login: 5 attempts / 10 min
    private Limit login = new Limit(5, 600);

    // Register: 3 attempts / 1 hour
    private Limit register = new Limit(3, 3600);

    // AI Generation: 10 / 10 min (User)
    private Limit generationUser = new Limit(10, 600);
    // AI Generation: 30 / 10 min (IP)
    private Limit generationIp = new Limit(30, 600);

    // AI Analysis: 10 / 10 min (User)
    private Limit analysisUser = new Limit(10, 600);
    // AI Analysis: 30 / 10 min (IP)
    private Limit analysisIp = new Limit(30, 600);

    @Data
    public static class Limit {
        private int capacity;
        private int durationSeconds;

        public Limit() {}

        public Limit(int capacity, int durationSeconds) {
            this.capacity = capacity;
            this.durationSeconds = durationSeconds;
        }
    }
}
