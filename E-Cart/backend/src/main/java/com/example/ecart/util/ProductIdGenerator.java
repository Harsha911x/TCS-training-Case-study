package com.example.ecart.util;

import com.example.ecart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProductIdGenerator {
    @Autowired
    private ProductRepository productRepository;

    public synchronized String generateProductId() {
        long count = productRepository.count();
        int nextId = (int) (count % 1000) + 1;
        return String.format("%03d", nextId);
    }
}

