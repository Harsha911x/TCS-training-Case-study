package com.example.ecart.dto.request;

import com.example.ecart.domain.entity.Order;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotNull(message = "Payment mode is required")
    private Order.PaymentMode paymentMode;

    // Credit Card fields
    private String cardNumber;
    private String cardHolderName;
    private String expiryDate; // MM/YY
    private String cvv;

    // UPI field
    private String upiId;

    private String addressSnapshot;
}

