package com.example.ecart.dto.response;

import com.example.ecart.domain.entity.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponse {
    private UUID id;
    private String customerId;
    private String name;
    private String country;
    private String state;
    private String city;
    private String address1;
    private String address2;
    private String zipCode;
    private String phoneNumber;
    private String email;
    private Customer.CustomerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

