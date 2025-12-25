package com.example.ecart.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateOrderRequest {
    private LocalDate arrivingDate;
    private String addressSnapshot; // JSON string
    private String orderStatus;
}

