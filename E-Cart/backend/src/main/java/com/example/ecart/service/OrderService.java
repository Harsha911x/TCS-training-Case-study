package com.example.ecart.service;

import com.example.ecart.domain.entity.*;
import com.example.ecart.dto.request.FeedbackRequest;
import com.example.ecart.dto.request.UpdateOrderRequest;
import com.example.ecart.dto.response.OrderItemResponse;
import com.example.ecart.dto.response.OrderResponse;
import com.example.ecart.repository.*;
import com.example.ecart.util.OrderIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderIdGenerator orderIdGenerator;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Transactional
    public OrderResponse createOrderFromCart(String customerId, String addressSnapshot) {
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Map<String, Object>> cartItems = cartService.getCart(customerId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate total amount first
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Map<String, Object> item : cartItems) {
            BigDecimal price = (BigDecimal) item.get("price");
            Integer quantity = (Integer) item.get("quantity");
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(quantity)));
        }

        // Create and save Order first (must be saved before creating OrderItems)
        Order order = Order.builder()
                .orderId(orderIdGenerator.generateOrderId())
                .customer(customer)
                .status(Order.OrderStatus.CONFIRMED)
                .addressSnapshot(addressSnapshot)
                .totalAmount(totalAmount)
                .paymentMode(Order.PaymentMode.CREDIT_CARD) // Default, will be updated during payment
                .build();
        
        // Save order first to make it persistent
        order = orderRepository.save(order);

        // Now create OrderItems with the saved Order
        for (Map<String, Object> item : cartItems) {
            String productId = (String) item.get("productId");
            Integer quantity = (Integer) item.get("quantity");
            BigDecimal price = (BigDecimal) item.get("price");

            Product product = productRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            if (product.getQuantityAvailable() < quantity) {
                throw new RuntimeException("Insufficient quantity for product: " + product.getName());
            }

            // Update product quantity
            product.setQuantityAvailable(product.getQuantityAvailable() - quantity);
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order) // Now order is persistent
                    .product(product)
                    .productName(product.getName())
                    .category(product.getCategory())
                    .unitPrice(price)
                    .quantity(quantity)
                    .description(product.getDescription())
                    .build();

            orderItemRepository.save(orderItem);
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(String orderId, String customerId, String cancellationReason) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (order.getStatus() == Order.OrderStatus.IN_TRANSIT || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }

        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed orders can be cancelled");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledDate(LocalDateTime.now());
        order.setCancellationReason(cancellationReason);

        // Restore product quantities
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setQuantityAvailable(product.getQuantityAvailable() + item.getQuantity());
            productRepository.save(product);
        }

        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrder(String orderId, UpdateOrderRequest request) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.CANCELLED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot update order in current status");
        }

        if (request.getArrivingDate() != null) {
            order.setArrivingDate(request.getArrivingDate());
        }
        if (request.getAddressSnapshot() != null) {
            order.setAddressSnapshot(request.getAddressSnapshot());
        }
        if (request.getOrderStatus() != null) {
            if (Order.OrderStatus.valueOf(request.getOrderStatus()) == Order.OrderStatus.CANCELLED) {
                order.setCancelledDate(LocalDateTime.now());
            }
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(request.getOrderStatus());
            order.setStatus(orderStatus);
        }

        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse adminCancelOrder(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed orders can be cancelled");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order.setCancelledDate(LocalDateTime.now());

        // Restore product quantities
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setQuantityAvailable(product.getQuantityAvailable() + item.getQuantity());
            productRepository.save(product);
        }

        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    public Page<OrderResponse> getCustomerOrders(String customerId, Specification<Order> spec, Pageable pageable) {
        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Specification<Order> customerSpec = (root, query, cb) -> cb.equal(root.get("customer"), customer);
        Specification<Order> checkInvoice = (root, query, cb) -> cb.isNotNull(root.get("invoiceId"));
        Specification<Order> combinedSpec = spec.and(customerSpec).and(checkInvoice);

        return orderRepository.findAll(combinedSpec, pageable).map(this::mapToResponse);
    }

    public Page<OrderResponse> getAllOrders(Specification<Order> spec, Pageable pageable) {
        return orderRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    public OrderResponse getOrderByOrderId(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Transactional
    public void createFeedback(String customerId, FeedbackRequest request) {
        Order order = orderRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomer().getCustomerId().equals(customerId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Feedback can only be provided for delivered orders");
        }

        // Verify product is in the order
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        boolean productInOrder = orderItems.stream()
                .anyMatch(item -> item.getProduct().getProductId().equals(request.getProductId()));
        
        if (!productInOrder) {
            throw new RuntimeException("Product not found in this order");
        }

        Product product = productRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if feedback already exists for this order-product combination
        List<Feedback> existingFeedback = feedbackRepository.findAll().stream()
                .filter(f -> f.getOrder().getId().equals(order.getId()) 
                        && f.getProduct().getProductId().equals(request.getProductId())
                        && f.getCustomer().getCustomerId().equals(customerId))
                .collect(Collectors.toList());

        if (!existingFeedback.isEmpty()) {
            throw new RuntimeException("Feedback already exists for this product in this order");
        }

        Customer customer = customerRepository.findByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Feedback feedback = Feedback.builder()
                .order(order)
                .customer(customer)
                .product(product)
                .rating(request.getRating())
                .description(request.getDescription())
                .build();

        feedbackRepository.save(feedback);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrder(order);
        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getProductId())
                        .productName(item.getProductName())
                        .category(item.getCategory())
                        .unitPrice(item.getUnitPrice())
                        .quantity(item.getQuantity())
                        .description(item.getDescription())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderId(order.getOrderId())
                .customerId(order.getCustomer().getCustomerId())
                .customerName(order.getCustomer().getName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .arrivingDate(order.getArrivingDate())
                .cancelledDate(order.getCancelledDate())
                .cancellationReason(order.getCancellationReason())
                .addressSnapshot(order.getAddressSnapshot())
                .paymentMode(order.getPaymentMode())
                .transactionId(order.getTransactionId())
                .invoiceId(order.getInvoiceId())
                .items(itemResponses)
                .build();
    }
}

