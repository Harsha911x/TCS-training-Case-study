package com.example.ecart.controller;

import com.example.ecart.dto.response.AnalyticsResponse;
import com.example.ecart.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/analytics")
public class AnalyticsController {
    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @RequestParam(defaultValue = "MONTH") String period) {
        AnalyticsResponse response = analyticsService.getAnalytics(period);
        return ResponseEntity.ok(response);
    }
}

