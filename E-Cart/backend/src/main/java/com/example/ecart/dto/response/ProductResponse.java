package com.example.ecart.dto.response;

import com.example.ecart.domain.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private UUID id;
    private String productId;
    private String name;
    private String imageUrl;
    private BigDecimal price;
    private Product.ProductCategory category;
    private String description;
    private Integer quantityAvailable;
    private Product.ProductStatus status;
    private Boolean softDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}

