package com.example.ecart.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotBlank(message = "Order ID is required")
    private String orderId;

    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}

