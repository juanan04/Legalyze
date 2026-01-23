package com.legalyze.demo.service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.legalyze.demo.config.RateLimitConfig;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitingService {

    private final RateLimitConfig config;

    // WARNING: In-memory storage. Does not scale across multiple instances.
    // For production with multiple replicas, replace this with
    // Redis/Hazelcast/JCache.
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    public boolean tryConsume(String key, RateLimitConfig.Limit limitConfig) {
        if (!config.isEnabled()) {
            return true;
        }

        Bucket bucket = cache.computeIfAbsent(key, k -> createNewBucket(limitConfig));
        boolean consumed = bucket.tryConsume(1);

        if (!consumed) {
            log.warn("Rate limit exceeded for key: {}", key);
        }

        return consumed;
    }

    private Bucket createNewBucket(RateLimitConfig.Limit limitConfig) {
        Bandwidth limit = Bandwidth.classic(limitConfig.getCapacity(),
                Refill.greedy(limitConfig.getCapacity(), Duration.ofSeconds(limitConfig.getDurationSeconds())));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public long getAvailableTokens(String key, RateLimitConfig.Limit limitConfig) {
        Bucket bucket = cache.computeIfAbsent(key, k -> createNewBucket(limitConfig));
        return bucket.getAvailableTokens();
    }
}
