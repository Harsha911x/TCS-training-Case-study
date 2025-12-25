package com.example.ecart.controller;

import com.example.ecart.dto.request.CancelOrderRequest;
import com.example.ecart.dto.request.FeedbackRequest;
import com.example.ecart.dto.request.PaymentRequest;
import com.example.ecart.dto.request.UpdateCustomerRequest;
import com.example.ecart.dto.response.CustomerResponse;
import com.example.ecart.dto.response.OrderResponse;
import com.example.ecart.service.CartService;
import com.example.ecart.service.CustomerService;
import com.example.ecart.service.OrderService;
import com.example.ecart.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/customers/me")
public class CustomerController {
    @Autowired
    private CustomerService customerService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.example.ecart.service.InvoiceService invoiceService;

    @GetMapping
    public ResponseEntity<CustomerResponse> getMyProfile(Authentication authentication) {
        String customerId = authentication.getName();
        CustomerResponse response = customerService.getCustomerByCustomerId(customerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<?> updateMyProfile(@Valid @RequestBody UpdateCustomerRequest request, Authentication authentication) {
        try {
            String customerId = authentication.getName();
            CustomerResponse response = customerService.updateCustomer(customerId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/cart/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String customerId = authentication.getName();
            String productId = (String) request.get("productId");
            Integer quantity = ((Number) request.get("quantity")).intValue();
            cartService.addToCart(customerId, productId, quantity);
            return ResponseEntity.ok(new MessageResponse("Product added to cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/cart")
    public ResponseEntity<?> getCart(Authentication authentication) {
        String customerId = authentication.getName();
        List<Map<String, Object>> cart = cartService.getCart(customerId);
        Map<String, Object> response = new HashMap<>();
        response.put("items", cart);
        BigDecimal total = cart.stream()
                .map(item -> ((BigDecimal) item.get("price")).multiply(BigDecimal.valueOf((Integer) item.get("quantity"))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.put("total", total);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cart/update")
    public ResponseEntity<?> updateCartItem(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String customerId = authentication.getName();
            String productId = (String) request.get("productId");
            Integer quantity = ((Number) request.get("quantity")).intValue();
            cartService.updateCartItem(customerId, productId, quantity);
            return ResponseEntity.ok(new MessageResponse("Cart updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/cart/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable String productId, Authentication authentication) {
        try {
            String customerId = authentication.getName();
            cartService.removeFromCart(customerId, productId);
            return ResponseEntity.ok(new MessageResponse("Product removed from cart"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/cart/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String customerId = authentication.getName();
            String addressSnapshot = request.get("addressSnapshot");
            OrderResponse order = orderService.createOrderFromCart(customerId, addressSnapshot);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/payments")
    public ResponseEntity<?> makePayment(@Valid @RequestBody PaymentRequest request, Authentication authentication) {
        try {
            String orderId = request.getOrderId();
            String customerId = authentication.getName();
            Map<String, String> response = paymentService.processPayment(orderId, request, customerId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            Authentication authentication) {
        String customerId = authentication.getName();
        Specification<com.example.ecart.domain.entity.Order> spec = buildOrderSpecification(status, dateFrom, dateTo);
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") 
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<OrderResponse> orders = orderService.getCustomerOrders(customerId, spec, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String orderId, Authentication authentication) {
        OrderResponse order = orderService.getOrderByOrderId(orderId);
        if (!order.getCustomerId().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId, 
                                         @Valid @RequestBody CancelOrderRequest request,
                                         Authentication authentication) {
        try {
            String customerId = authentication.getName();
            OrderResponse order = orderService.cancelOrder(orderId, customerId, request.getReason());
            Map<String, Object> response = new HashMap<>();
            response.put("order", order);
            response.put("message", "The amount will refund to customer account in 5 working days");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/invoices/{orderId}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String orderId, Authentication authentication) {
        try {
            OrderResponse order = orderService.getOrderByOrderId(orderId);
            if (!order.getCustomerId().equals(authentication.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            byte[] pdf = invoiceService.generateInvoicePdf(orderId);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "invoice-" + orderId + ".pdf");
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> createFeedback(@Valid @RequestBody FeedbackRequest request, Authentication authentication) {
        try {
            String customerId = authentication.getName();
            orderService.createFeedback(customerId, request);
            return ResponseEntity.ok(new MessageResponse("Feedback submitted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    private Specification<com.example.ecart.domain.entity.Order> buildOrderSpecification(String status, String dateFrom, String dateTo) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), com.example.ecart.domain.entity.Order.OrderStatus.valueOf(status)));
            }
            if (dateFrom != null && !dateFrom.isEmpty()) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), java.time.LocalDateTime.parse(dateFrom)));
            }
            if (dateTo != null && !dateTo.isEmpty()) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), java.time.LocalDateTime.parse(dateTo)));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }

    private static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }
}

