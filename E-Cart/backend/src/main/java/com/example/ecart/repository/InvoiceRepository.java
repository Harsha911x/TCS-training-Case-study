package com.example.ecart.repository;

import com.example.ecart.domain.entity.Invoice;
import com.example.ecart.domain.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByOrder(Order order);
    Optional<Invoice> findByOrderId(UUID orderId);
}

