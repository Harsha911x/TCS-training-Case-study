package com.example.ecart.dto.request;

import com.example.ecart.domain.entity.Product;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateProductRequest {
    @NotBlank(message = "Product name is required")
    @Size(max = 50, message = "Product name must not exceed 50 characters")
    private String name;

    private String imageUrl;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private Product.ProductCategory category;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    private String description;

    @NotNull(message = "Quantity available is required")
    @Min(value = 0, message = "Quantity available must be 0 or greater")
    private Integer quantityAvailable;

    private Product.ProductStatus status;
}

