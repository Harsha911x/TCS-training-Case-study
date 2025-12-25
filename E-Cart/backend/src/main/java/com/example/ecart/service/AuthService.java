package com.example.ecart.service;

import com.example.ecart.domain.entity.AdminUser;
import com.example.ecart.domain.entity.Customer;
import com.example.ecart.dto.request.AdminLoginRequest;
import com.example.ecart.dto.request.CustomerRegistrationRequest;
import com.example.ecart.dto.request.LoginRequest;
import com.example.ecart.dto.response.AuthResponse;
import com.example.ecart.repository.AdminUserRepository;
import com.example.ecart.repository.CustomerRepository;
import com.example.ecart.security.JwtUtil;
import com.example.ecart.util.CustomerIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomerIdGenerator customerIdGenerator;

    @Transactional
    public AuthResponse registerCustomer(CustomerRegistrationRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Customer customer = Customer.builder()
                .customerId(customerIdGenerator.generateCustomerId())
                .name(request.getName())
                .country(request.getCountry())
                .state(request.getState())
                .city(request.getCity())
                .address1(request.getAddress1())
                .address2(request.getAddress2())
                .zipCode(request.getZipCode())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(Customer.CustomerStatus.ACTIVE)
                .build();

        customer = customerRepository.save(customer);

        String token = jwtUtil.generateToken(customer.getCustomerId(), "CUSTOMER");
        return AuthResponse.builder()
                .token(token)
                .role("CUSTOMER")
                .customerId(customer.getCustomerId())
                .customerName(customer.getName())
                .build();
    }

    public AuthResponse loginCustomer(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Email Id/ Password."));

        if (customer.getStatus() != Customer.CustomerStatus.ACTIVE) {
            throw new RuntimeException("Invalid Email Id/ Password.");
        }

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new RuntimeException("Invalid Email Id/ Password.");
        }

        String token = jwtUtil.generateToken(customer.getCustomerId(), "CUSTOMER");
        return AuthResponse.builder()
                .token(token)
                .role("CUSTOMER")
                .customerId(customer.getCustomerId())
                .customerName(customer.getName())
                .build();
    }

    public AuthResponse loginAdmin(AdminLoginRequest request) {
        AdminUser admin = adminUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!admin.getActive()) {
            throw new RuntimeException("Admin account is inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(admin.getUsername(), "ADMIN");
        return AuthResponse.builder()
                .token(token)
                .role("ADMIN")
                .username(admin.getUsername())
                .build();
    }
}

