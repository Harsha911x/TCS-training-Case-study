package com.example.ecart.controller;

import com.example.ecart.domain.entity.Order;
import com.example.ecart.domain.entity.Product;
import com.example.ecart.dto.request.CreateProductRequest;
import com.example.ecart.dto.request.FeedbackRequest;
import com.example.ecart.dto.request.UpdateOrderRequest;
import com.example.ecart.dto.request.UpdateProductRequest;
import com.example.ecart.dto.response.CustomerResponse;
import com.example.ecart.dto.response.FeedbackResponse;
import com.example.ecart.dto.response.OrderResponse;
import com.example.ecart.dto.response.ProductResponse;
import com.example.ecart.repository.CustomerRepository;
import com.example.ecart.repository.FeedbackRepository;
import com.example.ecart.service.OrderService;
import com.example.ecart.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@Valid @RequestBody CreateProductRequest request) {
        try {
            ProductResponse product = productService.createProduct(request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product Added Successfully");
            response.put("product", product);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable String productId, 
                                          @Valid @RequestBody UpdateProductRequest request) {
        try {
            ProductResponse product = productService.updateProduct(productId, request);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product Updated Successfully");
            response.put("product", product);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable String productId) {
        try {
            productService.deleteProduct(productId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Product deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/products/upload-image")
    public ResponseEntity<?> uploadProductImage(@RequestParam("file") MultipartFile file,
                                                 @RequestParam("productId") String productId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("File is empty"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/"))) {
                return ResponseEntity.badRequest().body(new ErrorResponse("File must be an image"));
            }

            // Save image to assets folder (relative to project root)
            String fileName = productId + ".jpg";
            String uploadDir = "frontend/src/assets/products/";
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            java.io.File destFile = new java.io.File(dir, fileName);
            file.transferTo(destFile);

            // Update product image URL
            com.example.ecart.dto.response.ProductResponse product = productService.getProductByProductId(productId);
            UpdateProductRequest updateRequest = new UpdateProductRequest();
            updateRequest.setName(product.getName());
            updateRequest.setImageUrl("assets/products/" + fileName);
            updateRequest.setPrice(product.getPrice());
            updateRequest.setCategory(product.getCategory());
            updateRequest.setDescription(product.getDescription());
            updateRequest.setQuantityAvailable(product.getQuantityAvailable());
            updateRequest.setStatus(product.getStatus());
            productService.updateProduct(productId, updateRequest);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Image uploaded successfully");
            response.put("imageUrl", "/assets/products/" + fileName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Error uploading image: " + e.getMessage()));
        }
    }

    @PostMapping("/products/bulk-upload")
    public ResponseEntity<?> bulkUploadProducts(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("File is empty"));
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.endsWith(".csv") && !fileName.endsWith(".xls") && !fileName.endsWith(".xlsx"))) {
                return ResponseEntity.badRequest().body(new ErrorResponse("File must be CSV or XLS/XLSX format"));
            }

            // Parse CSV/XLS and create products
            List<Map<String, String>> products = parseBulkUploadFile(file);
            List<String> errors = new ArrayList<>();
            int successCount = 0;

            for (Map<String, String> productData : products) {
                try {
                    CreateProductRequest request = new CreateProductRequest();
                    request.setName(productData.get("name"));
                    request.setPrice(new BigDecimal(productData.get("price")));
                    request.setCategory(Product.ProductCategory.valueOf(productData.get("category").toUpperCase()));
                    request.setDescription(productData.get("description"));
                    request.setQuantityAvailable(Integer.parseInt(productData.get("quantityAvailable")));
                    request.setImageUrl(productData.get("imageUrl"));
                    request.setStatus(productData.containsKey("status") ? 
                        Product.ProductStatus.valueOf(productData.get("status").toUpperCase()) : null);
                    
                    productService.createProduct(request);
                    successCount++;
                } catch (Exception e) {
                    errors.add("Error processing product " + productData.get("name") + ": " + e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bulk upload completed");
            response.put("successCount", successCount);
            response.put("errorCount", errors.size());
            if (!errors.isEmpty()) {
                response.put("errors", errors);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Error processing bulk upload: " + e.getMessage()));
        }
    }

    private List<Map<String, String>> parseBulkUploadFile(MultipartFile file) throws Exception {
        List<Map<String, String>> products = new ArrayList<>();
        String fileName = file.getOriginalFilename();
        
        if (fileName != null && fileName.endsWith(".csv")) {
            // Parse CSV
            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(file.getInputStream()))) {
                String line = reader.readLine(); // Skip header
                while ((line = reader.readLine()) != null) {
                    String[] values = line.split(",");
                    if (values.length >= 5) {
                        Map<String, String> product = new HashMap<>();
                        product.put("name", values[0].trim());
                        product.put("price", values[1].trim());
                        product.put("category", values[2].trim());
                        product.put("description", values.length > 3 ? values[3].trim() : "");
                        product.put("quantityAvailable", values.length > 4 ? values[4].trim() : "0");
                        product.put("imageUrl", values.length > 5 ? values[5].trim() : "");
                        if (values.length > 6) {
                            product.put("status", values[6].trim());
                        }
                        products.add(product);
                    }
                }
            }
        } else {
            // For XLS/XLSX, return empty list for now (would need Apache POI)
            throw new RuntimeException("XLS/XLSX parsing not yet implemented. Please use CSV format.");
        }
        
        return products;
    }

    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Product.ProductCategory category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Product.ProductStatus status,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
        Specification<Product> spec = buildProductSpecification(productId, name, category, minPrice, maxPrice, status, minStock, false);
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<ProductResponse> products = productService.getAllProducts(spec, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/customers")
    public ResponseEntity<Page<CustomerResponse>> getCustomers(
            @RequestParam(required = false) String id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Specification<com.example.ecart.domain.entity.Customer> spec = buildCustomerSpecification(
                id, name, country, state, city, phone, email, dateFrom, dateTo);
        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerResponse> customers = customerRepository.findAll(spec, pageable)
                .map(c -> CustomerResponse.builder()
                        .id(c.getId())
                        .customerId(c.getCustomerId())
                        .name(c.getName())
                        .country(c.getCountry())
                        .state(c.getState())
                        .city(c.getCity())
                        .address1(c.getAddress1())
                        .address2(c.getAddress2())
                        .zipCode(c.getZipCode())
                        .phoneNumber(c.getPhoneNumber())
                        .email(c.getEmail())
                        .status(c.getStatus())
                        .createdAt(c.getCreatedAt())
                        .updatedAt(c.getUpdatedAt())
                        .build());
        return ResponseEntity.ok(customers);
    }

    @DeleteMapping("/customers/{customerId}")
    public ResponseEntity<?> deleteCustomer(@PathVariable String customerId) {
        try {
            com.example.ecart.domain.entity.Customer customer = customerRepository.findByCustomerId(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            customer.setStatus(com.example.ecart.domain.entity.Customer.CustomerStatus.INACTIVE);
            customerRepository.save(customer);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Customer deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Specification<Order> spec = buildOrderSpecification(status);
        Sort sortDesc = Sort.by("createdAt").descending();
        Pageable pageable = PageRequest.of(page, size, sortDesc);
        Specification<Order> checkInvoice = (root, query, cb) -> cb.isNotNull(root.get("invoiceId"));
        Specification<Order> combinedSpec = spec.and(checkInvoice);
        Page<OrderResponse> orders = orderService.getAllOrders(combinedSpec, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String orderId) {
        OrderResponse order = orderService.getOrderByOrderId(orderId);
        return ResponseEntity.ok(order);
    }

    @PutMapping("/orders/{orderId}")
    public ResponseEntity<?> updateOrder(@PathVariable String orderId, 
                                        @Valid @RequestBody UpdateOrderRequest request) {
        try {
            OrderResponse order = orderService.updateOrder(orderId, request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        try {
            OrderResponse order = orderService.adminCancelOrder(orderId);
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            response.put("message", "Order cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/orders/{orderId}/feedback")
    public ResponseEntity<?> getOrderFeedback(@PathVariable String orderId) {
        OrderResponse order = orderService.getOrderByOrderId(orderId);
        // Implementation to get feedback for order
        return ResponseEntity.ok(new HashMap<>());
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback(
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) Product.ProductCategory category) {
        List<com.example.ecart.domain.entity.Feedback> feedbacks = feedbackRepository.findAll();
        List<FeedbackResponse> responses = feedbacks.stream()
                .filter(f -> f.getOrder().getStatus() == Order.OrderStatus.DELIVERED)
                .filter(f -> productId == null || f.getProduct().getProductId().equals(productId))
                .filter(f -> category == null || f.getProduct().getCategory() == category)
                .map(f -> FeedbackResponse.builder()
                        .orderId(f.getOrder().getOrderId())
                        .customerId(f.getCustomer().getCustomerId())
                        .customerName(f.getCustomer().getName())
                        .productId(f.getProduct().getProductId())
                        .productName(f.getProduct().getName())
                        .productCategory(f.getProduct().getCategory())
                        .description(f.getDescription())
                        .rating(f.getRating())
                        .createdAt(f.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    private Specification<Product> buildProductSpecification(String productId, String name, 
                                                              Product.ProductCategory category,
                                                              BigDecimal minPrice, BigDecimal maxPrice,
                                                              Product.ProductStatus status,
                                                              Integer minStock,
                                                              boolean activeOnly) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (productId != null && !productId.isEmpty()) {
                predicates.add(cb.equal(root.get("productId"), productId));
            }
            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (minStock != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("quantityAvailable"), minStock));
            }
            if (activeOnly) {
                predicates.add(cb.equal(root.get("status"), Product.ProductStatus.ACTIVE));
                predicates.add(cb.equal(root.get("softDeleted"), false));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<com.example.ecart.domain.entity.Customer> buildCustomerSpecification(
            String id, String name, String country, String state, String city, String phone, String email,
            String dateFrom, String dateTo) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (id != null && !id.isEmpty()) {
                predicates.add(cb.equal(root.get("customerId"), id));
            }
            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (country != null && !country.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("country")), "%" + country.toLowerCase() + "%"));
            }
            if (state != null && !state.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("state")), "%" + state.toLowerCase() + "%"));
            }
            if (city != null && !city.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
            }
            if (phone != null && !phone.isEmpty()) {
                predicates.add(cb.like(root.get("phoneNumber"), "%" + phone + "%"));
            }
            if (email != null && !email.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
            }
            if (dateFrom != null && !dateFrom.isEmpty()) {
                try {
                    LocalDate fromDate = LocalDate.parse(dateFrom, DateTimeFormatter.ISO_LOCAL_DATE);
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate.atStartOfDay()));
                } catch (Exception e) {
                    // Ignore invalid date format
                }
            }
            if (dateTo != null && !dateTo.isEmpty()) {
                try {
                    LocalDate toDate = LocalDate.parse(dateTo, DateTimeFormatter.ISO_LOCAL_DATE);
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate.atTime(23, 59, 59)));
                } catch (Exception e) {
                    // Ignore invalid date format
                }
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private Specification<Order> buildOrderSpecification(String status) {
        return (root, query, cb) -> {
            if (status != null && !status.isEmpty()) {
                return cb.equal(root.get("status"), Order.OrderStatus.valueOf(status));
            }
            return cb.conjunction();
        };
    }

    private static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}

