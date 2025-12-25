package com.example.ecart.util;

import com.example.ecart.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class OrderIdGenerator {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    
    @Autowired
    private OrderRepository orderRepository;

    public String generateOrderId() {
        String orderId;
        int maxRetries = 100; // Prevent infinite loop
        int retryCount = 0;
        
        do {
            String timestamp = LocalDateTime.now().format(DATE_FORMATTER);
            String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            orderId = String.format("ORD-%s-%s", timestamp, uuid);
            retryCount++;
            
            if (retryCount > maxRetries) {
                throw new RuntimeException("Unable to generate unique order ID after " + maxRetries + " attempts");
            }
        } while (orderRepository.existsByOrderId(orderId));
        
        return orderId;
    }
}

