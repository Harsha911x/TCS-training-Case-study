package com.example.ecart.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CustomerRegistrationRequest {
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
    @Pattern(regexp = "^[1-9]\\d{9,14}$", message = "Phone Number should not start with 0.")
    private String phoneNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 10, message = "Your password must be at least 10 characters long, containing at least one number, one uppercase letter and one alphanumeric character")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{10,}$", 
             message = "Your password must be at least 10 characters long, containing at least one number, one uppercase letter and one alphanumeric character")
    private String password;
}

