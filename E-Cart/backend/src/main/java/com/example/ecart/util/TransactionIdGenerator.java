package com.example.ecart.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class TransactionIdGenerator {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public String generateTransactionId() {
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return String.format("TXN-%s-%s", timestamp, uuid);
    }
}

