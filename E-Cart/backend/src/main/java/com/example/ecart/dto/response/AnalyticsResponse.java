package com.example.ecart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private OverviewData overview;
    private SalesData sales;
    private OrdersData orders;
    private ProductsData products;
    private CustomersData customers;
    private PaymentsData payments;
    private ReturnsData returns;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewData {
        private BigDecimal revenueToday;
        private BigDecimal revenueWeek;
        private BigDecimal revenueMonth;
        private BigDecimal revenueMTD;
        private BigDecimal revenueYTD;
        private Long ordersCount;
        private BigDecimal averageOrderValue;
        private Double conversionRate;
        private Long activeUsers;
        private BigDecimal refundsAmount;
        private BigDecimal returnsAmount;
        private List<TimeSeriesPoint> revenueTrend;
        private List<TimeSeriesPoint> ordersTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesData {
        private BigDecimal totalSales;
        private BigDecimal netSales;
        private List<TimeSeriesPoint> salesByDay;
        private List<HourlySales> salesByHour;
        private List<TopProduct> topProductsByRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrdersData {
        private Long totalOrders;
        private Map<String, Long> ordersByStatus;
        private Double averageTimeToShip;
        private Long fulfillmentSlaBreaches;
        private List<StatusDistribution> statusDistribution;
        private FunnelData conversionFunnel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductsData {
        private List<TopProduct> topSellersByRevenue;
        private List<TopProduct> topSellersByQuantity;
        private List<LowStockProduct> lowStockProducts;
        private Long totalStockouts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomersData {
        private Long newCustomers;
        private Long returningCustomers;
        private BigDecimal averageLTV;
        private List<CohortData> cohortRetention;
        private List<RFMSegment> rfmSegments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentsData {
        private Double successRate;
        private Long failedPayments;
        private Long chargebacks;
        private Long fraudFlags;
        private Double averageProcessingTime;
        private List<TimeSeriesPoint> paymentTrend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnsData {
        private Double returnRate;
        private BigDecimal refundAmount;
        private Map<String, Long> reasonsDistribution;
        private Double averageTimeToRefund;
        private List<TopReturnedProduct> topReturnedProducts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String date;
        private BigDecimal value;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlySales {
        private Integer hour;
        private BigDecimal amount;
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private String productId;
        private String productName;
        private BigDecimal revenue;
        private Long quantitySold;
        private BigDecimal price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusDistribution {
        private String status;
        private Long count;
        private BigDecimal percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FunnelData {
        private Long cartSessions;
        private Long checkoutSessions;
        private Long paidOrders;
        private Long shippedOrders;
        private Double cartToCheckoutRate;
        private Double checkoutToPaidRate;
        private Double paidToShippedRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockProduct {
        private String productId;
        private String productName;
        private Integer quantityAvailable;
        private Integer threshold;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CohortData {
        private String cohort;
        private Long customers;
        private Double retentionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RFMSegment {
        private String segment;
        private Long customers;
        private BigDecimal averageLTV;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopReturnedProduct {
        private String productId;
        private String productName;
        private Long returnCount;
        private BigDecimal refundAmount;
    }
}

