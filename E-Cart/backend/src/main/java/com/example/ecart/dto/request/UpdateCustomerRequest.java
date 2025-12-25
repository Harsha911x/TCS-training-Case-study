package com.example.ecart.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateCustomerRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name must not exceed 50 characters")
    private String name;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Address1 is required")
    private String address1;

    private String address2;

    @NotBlank(message = "Zip code is required")
    private String zipCode;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[1-9]\\d{9,14}$", message = "Phone number must not start with 0 and must include country code (10-15 digits)")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String password; // Optional - only if changing password (validated in service)

    private String confirmPassword; // Optional - only if changing password
}

