package com.example.ecart.service;

import com.example.ecart.domain.entity.*;
import com.example.ecart.dto.request.PaymentRequest;
import com.example.ecart.repository.*;
import com.example.ecart.util.TransactionIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PaymentAttemptRepository paymentAttemptRepository;

    @Autowired
    private TransactionIdGenerator transactionIdGenerator;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private CartService cartService;

    @Transactional
    public Map<String, String> processPayment(String orderId, PaymentRequest request, String customerId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order is not in confirmed status");
        }

        // Validate payment details
        validatePaymentRequest(request);

        // Simulate payment gateway (for dev - always succeeds)
        boolean paymentSuccess = simulatePaymentGateway(request);

        PaymentAttempt paymentAttempt = PaymentAttempt.builder()
                .order(order)
                .mode(PaymentAttempt.PaymentMode.valueOf(request.getPaymentMode().name()))
                .payload(buildPaymentPayload(request))
                .status(paymentSuccess ? PaymentAttempt.PaymentStatus.SUCCESS : PaymentAttempt.PaymentStatus.FAILED)
                .createdAt(LocalDateTime.now())
                .build();

        if (paymentSuccess) {
            String transactionId = transactionIdGenerator.generateTransactionId();
            paymentAttempt.setTransactionId(transactionId);
            order.setTransactionId(transactionId);
            order.setPaymentMode(request.getPaymentMode());
            order.setStatus(Order.OrderStatus.CONFIRMED);
            if (request.getAddressSnapshot().length() > 0) {
                order.setAddressSnapshot(request.getAddressSnapshot());
            }

            // Generate invoice
            Invoice invoice = invoiceService.generateInvoice(order, transactionId);
            order.setInvoiceId(invoice.getId().toString());

            orderRepository.save(order);
            paymentAttemptRepository.save(paymentAttempt);

            Map<String, String> response = new HashMap<>();
            response.put("transactionId", transactionId);
            response.put("orderId", order.getOrderId());
            response.put("status", "SUCCESS");
            response.put("message", "Payment processed successfully");
            cartService.clearCart(customerId);
            return response;
        } else {
            paymentAttemptRepository.save(paymentAttempt);
            throw new RuntimeException("Payment failed. Please try again.");
        }
    }

    private void validatePaymentRequest(PaymentRequest request) {
        // Simplified validation for development - just check that payment mode is set
        if (request.getPaymentMode() == null) {
            throw new RuntimeException("Payment mode is required");
        }
        
        // For development, minimal validation - just ensure required fields are present
        if (request.getPaymentMode() == Order.PaymentMode.CREDIT_CARD) {
            if (request.getCardNumber() == null || request.getCardNumber().trim().isEmpty()) {
                throw new RuntimeException("Card number is required");
            }
            if (request.getCardHolderName() == null || request.getCardHolderName().trim().isEmpty()) {
                throw new RuntimeException("Card holder name is required");
            }
            if (request.getExpiryDate() == null || request.getExpiryDate().trim().isEmpty()) {
                throw new RuntimeException("Expiry date is required");
            }
            if (request.getCvv() == null || request.getCvv().trim().isEmpty()) {
                throw new RuntimeException("CVV is required");
            }
        } else if (request.getPaymentMode() == Order.PaymentMode.UPI) {
            if (request.getUpiId() == null || request.getUpiId().trim().isEmpty()) {
                throw new RuntimeException("UPI ID is required");
            }
        }
    }

    private boolean simulatePaymentGateway(PaymentRequest request) {
        // For development: Always return true - payment always succeeds
        // In production, integrate with actual payment gateway here
        System.out.println("Payment simulation: Payment successful for order");
        return true;
    }

    private String buildPaymentPayload(PaymentRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("mode", request.getPaymentMode());
        if (request.getPaymentMode() == Order.PaymentMode.CREDIT_CARD) {
            payload.put("cardNumber", maskCardNumber(request.getCardNumber()));
            payload.put("cardHolderName", request.getCardHolderName());
            payload.put("expiryDate", request.getExpiryDate());
        } else {
            payload.put("upiId", request.getUpiId());
        }
        return payload.toString();
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        return "****" + cardNumber.substring(cardNumber.length() - 4);
    }
}

