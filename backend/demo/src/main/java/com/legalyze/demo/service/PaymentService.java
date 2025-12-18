package com.legalyze.demo.service;

import com.legalyze.demo.model.User;
import com.legalyze.demo.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public String createCheckoutSession(Long userId, String packId) throws Exception {
        long amount;
        long credits;
        String productName;

        // Simple hardcoded packs for MVP
        if ("pack_10".equals(packId)) {
            amount = 500; // $5.00 in cents
            credits = 10;
            productName = "10 Créditos de Análisis";
        } else if ("pack_50".equals(packId)) {
            amount = 2000; // $20.00 in cents
            credits = 50;
            productName = "50 Créditos de Análisis";
        } else {
            throw new IllegalArgumentException("Invalid pack ID");
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(userId.toString())
                .putMetadata("credits", String.valueOf(credits))
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(amount)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(productName)
                                                                .build())
                                                .build())
                                .build())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    public void handleWebhook(String payload, String sigHeader) {
        System.out.println("DEBUG: Webhook received. Payload length: " + payload.length());
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            System.out.println("DEBUG: Webhook signature verified. Event type: " + event.getType());
        } catch (SignatureVerificationException e) {
            System.err.println("ERROR: Invalid signature: " + e.getMessage());
            throw new IllegalArgumentException("Invalid signature");
        } catch (Exception e) {
            System.err.println("ERROR: Webhook error: " + e.getMessage());
            throw new RuntimeException("Webhook error");
        }

        if ("checkout.session.completed".equals(event.getType())) {
            Session session = null;
            if (event.getDataObjectDeserializer().getObject().isPresent()) {
                session = (Session) event.getDataObjectDeserializer().getObject().get();
            } else {
                System.out.println("DEBUG: Standard deserialization failed. Trying unsafe deserialization...");
                try {
                    session = (Session) event.getDataObjectDeserializer().deserializeUnsafe();
                } catch (Exception e) {
                    System.err.println("ERROR: Unsafe deserialization also failed: " + e.getMessage());
                }
            }

            if (session == null) {
                System.err.println("ERROR: Session object is null. Deserialization failed?");
                // Try to print raw json if possible, but we don't have it easily here without
                // parsing payload manually.
                // But we can check if event data object is present.
                System.err.println("DEBUG: Event data object present? "
                        + event.getDataObjectDeserializer().getObject().isPresent());
            } else {
                System.out.println("DEBUG: Session ID: " + session.getId());
                System.out.println("DEBUG: Client Reference ID: " + session.getClientReferenceId());
                System.out.println("DEBUG: Metadata: " + session.getMetadata());

                if (session.getClientReferenceId() != null) {
                    Long userId = Long.parseLong(session.getClientReferenceId());
                    int creditsToAdd = Integer.parseInt(session.getMetadata().get("credits"));

                    System.out
                            .println("DEBUG: Processing payment for user " + userId + ". Credits to add: "
                                    + creditsToAdd);

                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                    user.setCredits(user.getCredits() + creditsToAdd);
                    userRepository.save(user);

                    System.out.println("DEBUG: Successfully added " + creditsToAdd + " credits to user " + userId);
                } else {
                    System.err.println("ERROR: clientReferenceId is null in session object.");
                }
            }
        } else {
            System.out.println("DEBUG: Ignoring event type: " + event.getType());
        }
    }
}
