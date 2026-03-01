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
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Log4j2
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
        SessionCreateParams.Mode mode = SessionCreateParams.Mode.PAYMENT;
        boolean isSubscription = false;

        if ("pack_10".equals(packId)) {
            User user = userRepository.findById(userId).orElseThrow();
            if (!"active".equals(user.getSubscriptionStatus()) || "FREE".equals(user.getSubscriptionPlan())) {
                throw new IllegalStateException("Solo los usuarios PRO o STARTER pueden comprar recargas.");
            }
            amount = 2000; // 20.00 en céntimos
            credits = 10;
            productName = "10 Créditos Extra";
        } else if ("sub_starter".equals(packId)) {
            amount = 5900; // 59.00
            credits = 30; // 30 credits reset monthly
            productName = "Plan Starter";
            mode = SessionCreateParams.Mode.SUBSCRIPTION;
            isSubscription = true;
        } else if ("sub_pro".equals(packId)) {
            amount = 12900; // 129.00
            credits = 100;
            productName = "Plan Pro";
            mode = SessionCreateParams.Mode.SUBSCRIPTION;
            isSubscription = true;
        } else {
            throw new IllegalArgumentException("Invalid pack ID");
        }

        SessionCreateParams.LineItem.PriceData.Builder priceDataBuilder = SessionCreateParams.LineItem.PriceData
                .builder()
                .setCurrency("eur")
                .setUnitAmount(amount)
                .setProductData(
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                .setName(productName)
                                .build());

        if (isSubscription) {
            priceDataBuilder.setRecurring(
                    SessionCreateParams.LineItem.PriceData.Recurring.builder()
                            .setInterval(SessionCreateParams.LineItem.PriceData.Recurring.Interval.MONTH)
                            .build());
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(mode)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(userId.toString())
                .putMetadata("credits", String.valueOf(credits))
                .putMetadata("packId", packId)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(priceDataBuilder.build())
                                .build())
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        log.debug("Webhook received. Payload length: {}", payload.length());
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            log.debug("Webhook signature verified. Event type: {}", event.getType());
        } catch (SignatureVerificationException e) {
            log.error("Invalid signature: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid signature");
        } catch (Exception e) {
            log.error("Webhook error: {}", e.getMessage());
            throw new RuntimeException("Webhook error");
        }

        try {
            if ("checkout.session.completed".equals(event.getType())) {
                Session session = null;
                if (event.getDataObjectDeserializer().getObject().isPresent()) {
                    session = (Session) event.getDataObjectDeserializer().getObject().get();
                } else {
                    session = (Session) event.getDataObjectDeserializer().deserializeUnsafe();
                }

                if (session != null && session.getClientReferenceId() != null) {
                    Long userId = Long.parseLong(session.getClientReferenceId());

                    String packId = null;
                    int creditsToAdd = 0;
                    if (session.getMetadata() != null) {
                        packId = session.getMetadata().get("packId");
                        String creditsStr = session.getMetadata().get("credits");
                        if (creditsStr != null) {
                            creditsToAdd = Integer.parseInt(creditsStr);
                        }
                    }

                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                    if (packId != null && packId.startsWith("sub_")) {
                        String dsPlan = packId.equals("sub_starter") ? "STARTER" : "PRO";
                        user.setSubscriptionPlan(dsPlan);
                        user.setSubscriptionStatus("active");
                        user.setStripeSubscriptionId(session.getSubscription());
                        user.setStripeCustomerId(session.getCustomer());

                        // Adding credits for the first time
                        user.setCredits(user.getCredits() + creditsToAdd);
                        log.info("Activated {} plan for user {}. Added {} credits.", dsPlan, userId, creditsToAdd);
                    } else if ("pack_10".equals(packId)) {
                        // It's a top-up
                        user.setCredits(user.getCredits() + creditsToAdd);
                        log.info("Added {} top-up credits to user {}", creditsToAdd, userId);
                    } else {
                        user.setCredits(user.getCredits() + creditsToAdd);
                    }
                    userRepository.save(user);
                } else {
                    log.error(
                            "checkout.session.completed failed mapping. session={}, metadata={}, clientReferenceId={}",
                            session != null ? session.getId() : "null",
                            session != null ? session.getMetadata() : "null",
                            session != null ? session.getClientReferenceId() : "null");
                }
            } else if ("invoice.payment_succeeded".equals(event.getType())) {
                com.stripe.model.Invoice invoice = null;
                if (event.getDataObjectDeserializer().getObject().isPresent()) {
                    invoice = (com.stripe.model.Invoice) event.getDataObjectDeserializer().getObject().get();
                } else {
                    invoice = (com.stripe.model.Invoice) event.getDataObjectDeserializer().deserializeUnsafe();
                }

                if (invoice != null && invoice.getSubscription() != null
                        && "subscription_cycle".equals(invoice.getBillingReason())) {
                    User user = userRepository.findByStripeSubscriptionId(invoice.getSubscription()).orElse(null);
                    if (user != null) {
                        if ("PRO".equals(user.getSubscriptionPlan())) {
                            user.setCredits(user.getCredits() + 100);
                            log.info("Subscription renewed for PRO user {}. Added 100 credits.", user.getId());
                        } else if ("STARTER".equals(user.getSubscriptionPlan())) {
                            user.setCredits(user.getCredits() + 30);
                            log.info("Subscription renewed for STARTER user {}. Added 30 credits.", user.getId());
                        }
                        userRepository.save(user);
                    } else {
                        log.warn("Invoice paid for unknown subscription: {}", invoice.getSubscription());
                    }
                }
            } else if ("customer.subscription.deleted".equals(event.getType())
                    || "customer.subscription.updated".equals(event.getType())) {
                com.stripe.model.Subscription sub = null;
                if (event.getDataObjectDeserializer().getObject().isPresent()) {
                    sub = (com.stripe.model.Subscription) event.getDataObjectDeserializer().getObject().get();
                } else {
                    sub = (com.stripe.model.Subscription) event.getDataObjectDeserializer().deserializeUnsafe();
                }

                if (sub != null) {
                    User user = userRepository.findByStripeSubscriptionId(sub.getId()).orElse(null);
                    if (user != null) {
                        user.setSubscriptionStatus(sub.getStatus());
                        // Only downgrade if the subscription is completely canceled or past due/unpaid
                        if ("canceled".equals(sub.getStatus()) || "unpaid".equals(sub.getStatus())
                                || "past_due".equals(sub.getStatus())) {
                            user.setSubscriptionPlan("FREE");
                        }
                        userRepository.save(user);
                        log.info("Subscription {} status updated to {} for user {}", sub.getId(), sub.getStatus(),
                                user.getId());
                    }
                }
            } else {
                log.debug("Ignoring event type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Error processing webhook logic: {}", e.getMessage(), e);
            throw new RuntimeException("Error processing webhook logic", e);
        }
    }
}
