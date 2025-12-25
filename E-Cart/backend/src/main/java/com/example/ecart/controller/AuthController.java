package com.example.ecart.controller;

import com.example.ecart.dto.request.AdminLoginRequest;
import com.example.ecart.dto.request.CustomerRegistrationRequest;
import com.example.ecart.dto.request.LoginRequest;
import com.example.ecart.dto.response.AuthResponse;
import com.example.ecart.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/customer/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody CustomerRegistrationRequest request) {
        try {
            AuthResponse response = authService.registerCustomer(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/customer/login")
    public ResponseEntity<?> loginCustomer(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.loginCustomer(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        try {
            AuthResponse response = authService.loginAdmin(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    private static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}

