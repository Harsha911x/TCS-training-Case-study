package com.example.ecart.service;

import com.example.ecart.domain.entity.Customer;
import com.example.ecart.domain.entity.Product;
import com.example.ecart.dto.response.ProductResponse;
import com.example.ecart.repository.CustomerRepository;
import com.example.ecart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartService {
    // In-memory cart storage (in production, use Redis or database)
    private final Map<String, Map<String, Integer>> customerCarts = new ConcurrentHashMap<>();

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    public void addToCart(String customerId, String productId, Integer quantity) {
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStatus() != Product.ProductStatus.ACTIVE || product.getSoftDeleted()) {
            throw new RuntimeException("Product is not available");
        }

        if (product.getQuantityAvailable() < quantity) {
            throw new RuntimeException("Product limit exceeded");
        }

        customerCarts.computeIfAbsent(customerId, k -> new HashMap<>())
                .merge(productId, quantity, Integer::sum);
    }

    public void updateCartItem(String customerId, String productId, Integer quantity) {
        Map<String, Integer> cart = customerCarts.get(customerId);
        if (cart == null || !cart.containsKey(productId)) {
            throw new RuntimeException("Product not found in cart");
        }

        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (quantity > product.getQuantityAvailable()) {
            throw new RuntimeException("Product limit exceeded");
        }

        if (quantity <= 0) {
            cart.remove(productId);
        } else {
            cart.put(productId, quantity);
        }
    }

    public void removeFromCart(String customerId, String productId) {
        Map<String, Integer> cart = customerCarts.get(customerId);
        if (cart == null || !cart.containsKey(productId)) {
            throw new RuntimeException("Unable to delete product any further: Minimum quantity reached");
        }
        cart.remove(productId);
    }

    public List<Map<String, Object>> getCart(String customerId) {
        Map<String, Integer> cart = customerCarts.getOrDefault(customerId, new HashMap<>());
        List<Map<String, Object>> cartItems = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : cart.entrySet()) {
            Product product = productRepository.findByProductId(entry.getKey())
                    .orElse(null);
            if (product != null) {
                Map<String, Object> item = new HashMap<>();
                item.put("productId", product.getProductId());
                item.put("productName", product.getName());
                item.put("price", product.getPrice());
                item.put("quantity", entry.getValue());
                item.put("category", product.getCategory());
                item.put("description", product.getDescription());
                cartItems.add(item);
            }
        }

        return cartItems;
    }

    public void clearCart(String customerId) {
        customerCarts.remove(customerId);
    }
}

