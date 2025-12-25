package com.example.ecart.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders", uniqueConstraints = {
    @UniqueConstraint(columnNames = "order_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", unique = true, nullable = false, updatable = false)
    private String orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.CONFIRMED;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDate arrivingDate;

    private LocalDateTime cancelledDate;

    @Column(length = 500)
    private String cancellationReason;

    @Column(columnDefinition = "TEXT")
    private String addressSnapshot; // JSON string

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMode paymentMode;

    private String transactionId;

    private String invoiceId;

    public enum OrderStatus {
        CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED
    }

    public enum PaymentMode {
        CREDIT_CARD, UPI
    }
}

