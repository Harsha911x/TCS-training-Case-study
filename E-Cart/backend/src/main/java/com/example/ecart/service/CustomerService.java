package com.example.ecart.service;

import com.example.ecart.domain.entity.Customer;
import com.example.ecart.dto.request.UpdateCustomerRequest;
import com.example.ecart.dto.response.CustomerResponse;
import com.example.ecart.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public CustomerResponse getCustomerByCustomerId(String customerId) {
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(String customerId, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Check email uniqueness if changed
        if (!customer.getEmail().equals(request.getEmail()) && customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        customer.setName(request.getName());
        customer.setCountry(request.getCountry());
        customer.setState(request.getState());
        customer.setCity(request.getCity());
        customer.setAddress1(request.getAddress1());
        customer.setAddress2(request.getAddress2());
        customer.setZipCode(request.getZipCode());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());

        // Update password if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            if (request.getConfirmPassword() == null || request.getConfirmPassword().trim().isEmpty() || 
                !request.getPassword().equals(request.getConfirmPassword())) {
                throw new RuntimeException("Password and confirm password do not match");
            }
            // Validate password meets requirements
            if (request.getPassword().length() < 10) {
                throw new RuntimeException("Password must be at least 10 characters long");
            }
            if (!request.getPassword().matches("^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{10,}$")) {
                throw new RuntimeException("Password must contain at least one number, one uppercase letter and one alphanumeric character");
            }
            customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .country(customer.getCountry())
                .state(customer.getState())
                .city(customer.getCity())
                .address1(customer.getAddress1())
                .address2(customer.getAddress2())
                .zipCode(customer.getZipCode())
                .phoneNumber(customer.getPhoneNumber())
                .email(customer.getEmail())
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}

