package com.example.ecart.repository;

import com.example.ecart.domain.entity.Feedback;
import com.example.ecart.domain.entity.Order;
import com.example.ecart.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    Optional<Feedback> findByOrder(Order order);
    List<Feedback> findAllByOrderStatus(Order.OrderStatus status);
    List<Feedback> findByProduct(Product product);
    List<Feedback> findByProductProductId(String productId);
}

