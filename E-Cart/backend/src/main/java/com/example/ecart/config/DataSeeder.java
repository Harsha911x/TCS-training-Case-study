package com.example.ecart.config;

import com.example.ecart.domain.entity.AdminUser;
import com.example.ecart.domain.entity.Customer;
import com.example.ecart.domain.entity.Product;
import com.example.ecart.repository.AdminUserRepository;
import com.example.ecart.repository.CustomerRepository;
import com.example.ecart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {
    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCustomer();
        seedProducts();
    }

    private void seedAdmin() {
        if (adminUserRepository.findByUsername("admin").isEmpty()) {
            AdminUser admin = AdminUser.builder()
                    .username("admin")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .active(true)
                    .build();
            adminUserRepository.save(admin);
            System.out.println("Admin user created: admin / admin123");
        }
    }

    private void seedCustomer() {
        // Check if customer already exists by customer_id or email
        String customerId = "CUST-20240101-0001";
        String email = "demo@example.com";
        
        if (customerRepository.findByCustomerId(customerId).isEmpty() && 
            customerRepository.findByEmail(email).isEmpty()) {
            Customer customer = Customer.builder()
                    .customerId(customerId)
                    .name("Demo Customer")
                    .country("USA")
                    .state("California")
                    .city("San Francisco")
                    .address1("123 Main St")
                    .address2("Apt 4B")
                    .zipCode("94102")
                    .phoneNumber("14155551234")
                    .email(email)
                    .passwordHash(passwordEncoder.encode("Demo123456"))
                    .status(Customer.CustomerStatus.ACTIVE)
                    .build();
            customerRepository.save(customer);
            System.out.println("Demo customer created: CUST-20240101-0001 / Demo123456");
        } else {
            System.out.println("Demo customer already exists, skipping creation");
        }
    }

    private void seedProducts() {
        // Check and create each product individually to avoid duplicates
        seedProductIfNotExists("001", "Laptop Pro 15", "assets/products/hppavillion.jpg",
                new BigDecimal("72999.99"), Product.ProductCategory.ELECTRONICS,
                "High-performance laptop with 16GB RAM and 512GB SSD", 10);
        
        seedProductIfNotExists("002", "Wireless Mouse", "assets/products/mouse.jpg",
                new BigDecimal("299.99"), Product.ProductCategory.ELECTRONICS,
                "Ergonomic wireless mouse with long battery life", 50);
        
        seedProductIfNotExists("003", "Cotton T-Shirt", "assets/products/tshirts.jpg",
                new BigDecimal("199.99"), Product.ProductCategory.CLOTHING,
                "Comfortable 100% cotton t-shirt", 100);
        
        seedProductIfNotExists("004", "Spring Boot Guide", "assets/products/books.jpg",
                new BigDecimal("499.99"), Product.ProductCategory.BOOKS,
                "Complete guide to Spring Boot development", 25);
        
        seedProductIfNotExists("005", "Coffee Maker", "assets/products/coffee.jpg",
                new BigDecimal("7999.99"), Product.ProductCategory.HOME,
                "Programmable coffee maker with timer", 30);
    }
    
    private void seedProductIfNotExists(String productId, String name, String imageUrl,
                                       BigDecimal price, Product.ProductCategory category,
                                       String description, int quantityAvailable) {
        if (productRepository.findByProductId(productId).isEmpty()) {
            productRepository.save(Product.builder()
                    .productId(productId)
                    .name(name)
                    .imageUrl(imageUrl)
                    .price(price)
                    .category(category)
                    .description(description)
                    .quantityAvailable(quantityAvailable)
                    .status(Product.ProductStatus.ACTIVE)
                    .softDeleted(false)
                    .build());
            System.out.println("Product created: " + productId + " - " + name);
        }
    }
}

