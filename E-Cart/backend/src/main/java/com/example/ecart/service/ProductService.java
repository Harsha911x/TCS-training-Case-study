package com.example.ecart.service;

import com.example.ecart.domain.entity.Product;
import com.example.ecart.dto.request.CreateProductRequest;
import com.example.ecart.dto.request.UpdateProductRequest;
import com.example.ecart.dto.response.ProductResponse;
import com.example.ecart.dto.response.ProductHighlightsResponse;
import com.example.ecart.repository.ProductRepository;
import com.example.ecart.util.ProductIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductIdGenerator productIdGenerator;

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsByName(request.getName())) {
            throw new RuntimeException("Product name already exists");
        }

        Product product = Product.builder()
                .productId(productIdGenerator.generateProductId())
                .name(request.getName())
                .imageUrl(request.getImageUrl())
                .price(request.getPrice())
                .category(request.getCategory())
                .description(request.getDescription())
                .quantityAvailable(request.getQuantityAvailable())
                .status(request.getStatus() != null ? request.getStatus() : Product.ProductStatus.ACTIVE)
                .softDeleted(false)
                .build();

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(String productId, UpdateProductRequest request) {
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check name uniqueness if changed
        if (!product.getName().equals(request.getName()) && productRepository.existsByName(request.getName())) {
            throw new RuntimeException("Product name already exists");
        }

        product.setName(request.getName());
        product.setImageUrl(request.getImageUrl());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setDescription(request.getDescription());
        product.setQuantityAvailable(request.getQuantityAvailable());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
            // When setting status to ACTIVE, ensure softDeleted is false
            if (request.getStatus() == Product.ProductStatus.ACTIVE) {
                product.setSoftDeleted(false);
                product.setDeletedAt(null);
            }
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(String productId) {
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setStatus(Product.ProductStatus.INACTIVE);
        product.setSoftDeleted(true);
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    public ProductResponse getProductByProductId(String productId) {
        Product product = productRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    public Page<ProductResponse> getProducts(Specification<Product> spec, Pageable pageable) {
        return productRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    public Page<ProductResponse> getAllProducts(Specification<Product> spec, Pageable pageable) {
        return productRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    public ProductHighlightsResponse getLandingHighlights(int heroLimit, int sectionLimit) {
        List<ProductResponse> hero = getActiveProducts(heroLimit, Sort.by(Sort.Direction.DESC, "updatedAt"));
        List<ProductResponse> spotlight = getActiveProducts(sectionLimit, Sort.by(Sort.Direction.DESC, "price"));
        List<ProductResponse> topDeals = getActiveProducts(sectionLimit, Sort.by(Sort.Direction.ASC, "price"));
        List<ProductResponse> newArrivals = getActiveProducts(sectionLimit, Sort.by(Sort.Direction.DESC, "createdAt"));

        return ProductHighlightsResponse.builder()
                .heroProducts(hero)
                .spotlight(spotlight)
                .topDeals(topDeals)
                .newArrivals(newArrivals)
                .build();
    }

    public ProductHighlightsResponse getCustomerHighlights(int heroLimit, int sectionLimit) {
        List<ProductResponse> hero = getActiveProducts(heroLimit, Sort.by(Sort.Direction.DESC, "updatedAt"));
        List<ProductResponse> spotlight = getActiveProducts(sectionLimit, Sort.by(Sort.Direction.DESC, "quantityAvailable"));
        List<ProductResponse> topDeals = getActiveProducts(sectionLimit, Sort.by(Sort.Direction.ASC, "price"));
        List<ProductResponse> newArrivals = getActiveProducts(sectionLimit, Sort.by(Sort.Direction.DESC, "createdAt"));

        return ProductHighlightsResponse.builder()
                .heroProducts(hero)
                .spotlight(spotlight)
                .topDeals(topDeals)
                .newArrivals(newArrivals)
                .build();
    }

    private List<ProductResponse> getActiveProducts(int limit, Sort sort) {
        Pageable pageable = PageRequest.of(0, limit, sort);
        return productRepository
                .findByStatusAndSoftDeletedFalseAndQuantityAvailableGreaterThan(
                        Product.ProductStatus.ACTIVE, 0, pageable)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .productId(product.getProductId())
                .name(product.getName())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .category(product.getCategory())
                .description(product.getDescription())
                .quantityAvailable(product.getQuantityAvailable())
                .status(product.getStatus())
                .softDeleted(product.getSoftDeleted())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .deletedAt(product.getDeletedAt())
                .build();
    }
}

