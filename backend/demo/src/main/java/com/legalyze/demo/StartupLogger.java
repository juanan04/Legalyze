package com.legalyze.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StartupLogger implements CommandLineRunner {

    private final Environment env;

    @Override
    public void run(String... args) throws Exception {
        System.out.println(">>> DB_URL from env = " + env.getProperty("DB_URL"));
        System.out.println("Application started successfully");
    }
}