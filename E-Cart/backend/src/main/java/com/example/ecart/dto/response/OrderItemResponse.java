package com.example.ecart.dto.response;

import com.example.ecart.domain.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private UUID id;
    private String productId;
    private String productName;
    private Product.ProductCategory category;
    private BigDecimal unitPrice;
    private Integer quantity;
    private String description;
}

