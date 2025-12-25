package com.example.ecart.dto.response;

import com.example.ecart.domain.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private UUID id;
    private String orderId;
    private String customerId;
    private String customerName;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDate arrivingDate;
    private LocalDateTime cancelledDate;
    private String cancellationReason;
    private String addressSnapshot;
    private Order.PaymentMode paymentMode;
    private String transactionId;
    private String invoiceId;
    private List<OrderItemResponse> items;
}

