package com.legalyze.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Component
@RequiredArgsConstructor
@Log4j2
public class StartupLogger implements CommandLineRunner {

    private final Environment env;

    @Override
    public void run(String... args) throws Exception {
        log.info(">>> DB_URL from env = {}", env.getProperty("DB_URL"));
        log.info("Application started successfully");
    }
}