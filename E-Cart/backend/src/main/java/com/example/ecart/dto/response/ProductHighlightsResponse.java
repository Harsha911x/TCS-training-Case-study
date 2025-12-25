package com.example.ecart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductHighlightsResponse {
    @Builder.Default
    private List<ProductResponse> heroProducts = Collections.emptyList();

    @Builder.Default
    private List<ProductResponse> spotlight = Collections.emptyList();

    @Builder.Default
    private List<ProductResponse> topDeals = Collections.emptyList();

    @Builder.Default
    private List<ProductResponse> newArrivals = Collections.emptyList();
}

