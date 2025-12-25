package com.example.ecart.repository;

import com.example.ecart.domain.entity.Customer;
import com.example.ecart.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByOrderId(String orderId);
    java.util.List<Order> findByCustomer(Customer customer);
    boolean existsByOrderId(String orderId);
}

