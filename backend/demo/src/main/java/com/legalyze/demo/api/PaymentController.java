package com.legalyze.demo.api;

import com.legalyze.demo.model.User;
import com.legalyze.demo.service.PaymentService;
import com.legalyze.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, String> request) {
        try {
            User currentUser = userService.getCurrentUser();
            String packId = request.get("packId");

            String url = paymentService.createCheckoutSession(currentUser.getId(), packId);

            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        System.err.println("DEBUG: PaymentController received webhook request");
        try {
            paymentService.handleWebhook(payload, sigHeader);
            return ResponseEntity.ok("Received");
        } catch (Exception e) {
            System.err.println("Webhook Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Webhook Error: " + e.getMessage());
        }
    }
}
