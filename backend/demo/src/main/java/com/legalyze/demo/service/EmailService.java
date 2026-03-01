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

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendVerificationEmail(String to, String token) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            log.warn("Resend API key is not configured. Skipping email sending.");
            return;
        }

        Resend resend = new Resend(resendApiKey);

        String verificationLink = frontendUrl + "/verify-email?token=" + token;

        String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verifica tu correo electrónico</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f9; }
                        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                        .header { background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); padding: 40px 20px; text-align: center; }
                        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
                        .content { padding: 40px 30px; text-align: center; }
                        .content p { font-size: 16px; color: #4b5563; margin-bottom: 24px; }
                        .button { display: inline-block; background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
                        .button:hover { background-color: #4338ca; }
                        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
                        .footer a { color: #6b7280; text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Legalyze</h1>
                        </div>
                        <div class="content">
                            <h2>¡Bienvenido a bordo!</h2>
                            <p>Gracias por unirte a Legalyze. Estamos emocionados de tenerte aquí.</p>
                            <p>Para comenzar a analizar y generar tus contratos inteligentes, necesitamos verificar que este correo es tuyo.</p>
                            <a href="%s" class="button">Verificar mi cuenta</a>
                            <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="%s" style="color: #4f46e5;">%s</a></p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 Legalyze. Todos los derechos reservados.</p>
                            <p>Si no creaste esta cuenta, puedes ignorar este mensaje de forma segura.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(verificationLink, verificationLink, verificationLink);

        SendEmailRequest params = SendEmailRequest.builder()
                .from(fromEmail != null ? fromEmail : "noreply@juanan.me")
                .to(to)
                .subject("Verifica tu cuenta en Legalyze")
                .html(htmlContent)
                .build();

        try {
            resend.emails().send(params);
            log.info("Verification email sent to {}", to);
        } catch (ResendException e) {
            log.error("Error sending verification email: {}", e.getMessage());
            throw new IllegalArgumentException("No se pudo enviar el correo: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error sending email", e);
            throw new IllegalArgumentException("Error inesperado al enviar el correo");
        }
    }

    public void sendAdminNotification(String subject, String content) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            log.warn("Resend API key is not configured. Skipping admin notification.");
            return;
        }

        Resend resend = new Resend(resendApiKey);

        SendEmailRequest params = SendEmailRequest.builder()
                .from(fromEmail != null ? fromEmail : "noreply@juanan.me")
                .to("jca@juanan.me") // Replace with admin email later if needed, but currently hardcoded to user's personal email
                .subject(subject)
                .html("<p>" + content + "</p>")
                .build();

        try {
            resend.emails().send(params);
            log.info("Admin notification sent: {}", subject);
        } catch (Exception e) {
            log.error("Error sending admin notification: {}", e.getMessage());
        }
    }
}
