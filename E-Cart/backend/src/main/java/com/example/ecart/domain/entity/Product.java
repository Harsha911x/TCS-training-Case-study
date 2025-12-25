package com.example.ecart.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products", uniqueConstraints = {
    @UniqueConstraint(columnNames = "product_id"),
    @UniqueConstraint(columnNames = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "product_id", unique = true, nullable = false, updatable = false, length = 3)
    private String productId;

    @Column(unique = true, nullable = false, length = 50)
    private String name;

    private String imageUrl;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Column(length = 200)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityAvailable = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(nullable = false)
    @Builder.Default
    private Boolean softDeleted = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime deletedAt;

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ProductCategory {
        ELECTRONICS, CLOTHING, BOOKS, HOME, SPORTS, TOYS, FOOD, OTHER
    }

    public enum ProductStatus {
        ACTIVE, INACTIVE
    }
}

