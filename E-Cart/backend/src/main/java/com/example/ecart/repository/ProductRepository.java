package com.example.ecart.repository;

import com.example.ecart.domain.entity.Product;
import com.example.ecart.domain.entity.Product.ProductStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    Optional<Product> findByProductId(String productId);
    Optional<Product> findByName(String name);
    boolean existsByName(String name);
    long count();

    List<Product> findByStatusAndSoftDeletedFalseAndQuantityAvailableGreaterThan(
            ProductStatus status, Integer quantity, Pageable pageable);
}

