package com.legalyze.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.SendEmailRequest;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email}")
    private String fromEmail;

    public void sendVerificationEmail(String to, String token) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            log.warn("Resend API key is not configured. Skipping email sending.");
            return;
        }

        Resend resend = new Resend(resendApiKey);

        String verificationLink = "http://localhost:5173/verify-email?token=" + token;

        String htmlContent = "<h1>Verifica tu correo electrónico</h1>" +
                "<p>Gracias por registrarte en Legalyze. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>"
                +
                "<a href=\"" + verificationLink + "\">Verificar Email</a>" +
                "<p>Si no has creado esta cuenta, puedes ignorar este correo.</p>";

        SendEmailRequest params = SendEmailRequest.builder()
                .from(fromEmail != null ? fromEmail : "onboarding@resend.dev")
                .to(to)
                .subject("Verifica tu cuenta en Legalyze")
                .html(htmlContent)
                .build();

        try {
            resend.emails().send(params);
            log.info("Verification email sent to {}", to);
        } catch (ResendException e) {
            log.error("Error sending verification email", e);
            throw new RuntimeException("Error sending email", e);
        }
    }
}
