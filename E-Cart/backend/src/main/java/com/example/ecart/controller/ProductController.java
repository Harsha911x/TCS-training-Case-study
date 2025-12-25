package com.example.ecart.controller;

import com.example.ecart.domain.entity.Product;
import com.example.ecart.dto.response.ProductHighlightsResponse;
import com.example.ecart.dto.response.ProductResponse;
import com.example.ecart.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String productId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Product.ProductCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
        Specification<Product> spec = buildProductSpecification(productId, name, category, true);
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc") 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        Page<ProductResponse> products = productService.getProducts(spec, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable String productId) {
        ProductResponse product = productService.getProductByProductId(productId);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/landing/highlights")
    public ResponseEntity<ProductHighlightsResponse> getLandingHighlights(
            @RequestParam(defaultValue = "5") int heroLimit,
            @RequestParam(defaultValue = "8") int sectionLimit) {
        ProductHighlightsResponse response = productService.getLandingHighlights(
                Math.max(heroLimit, 1),
                Math.max(sectionLimit, 1)
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer/highlights")
    public ResponseEntity<ProductHighlightsResponse> getCustomerHighlights(
            @RequestParam(defaultValue = "4") int heroLimit,
            @RequestParam(defaultValue = "6") int sectionLimit) {
        ProductHighlightsResponse response = productService.getCustomerHighlights(
                Math.max(heroLimit, 1),
                Math.max(sectionLimit, 1)
        );
        return ResponseEntity.ok(response);
    }

    private Specification<Product> buildProductSpecification(String productId, String name, 
                                                              Product.ProductCategory category, 
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
            if (activeOnly) {
                predicates.add(cb.equal(root.get("status"), Product.ProductStatus.ACTIVE));
                predicates.add(cb.equal(root.get("softDeleted"), false));
                predicates.add(cb.greaterThanOrEqualTo(root.get("quantityAvailable"), 1));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}

