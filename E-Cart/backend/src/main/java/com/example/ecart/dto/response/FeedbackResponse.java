package com.example.ecart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackResponse {
    private String orderId;
    private String customerId;
    private String customerName;
    private String productId;
    private String productName;
    private com.example.ecart.domain.entity.Product.ProductCategory productCategory;
    private String description;
    private Integer rating;
    private LocalDateTime createdAt;
}

