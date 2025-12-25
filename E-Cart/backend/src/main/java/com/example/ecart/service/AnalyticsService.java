package com.example.ecart.service;

import com.example.ecart.domain.entity.*;
import com.example.ecart.dto.response.AnalyticsResponse;
import com.example.ecart.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private PaymentAttemptRepository paymentAttemptRepository;

    public AnalyticsResponse getAnalytics(String period) {
        LocalDate startDate = getStartDate(period);
        LocalDate endDate = LocalDate.now();
        
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)))
                .filter(o -> o.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1)))
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .overview(getOverviewData(orders, startDate, endDate))
                .sales(getSalesData(orders))
                .orders(getOrdersData(orders))
                .products(getProductsData(orders))
                .customers(getCustomersData(orders, startDate, endDate))
                .payments(getPaymentsData(orders))
                .returns(getReturnsData(orders))
                .build();
    }

    private LocalDate getStartDate(String period) {
        LocalDate now = LocalDate.now();
        switch (period != null ? period.toUpperCase() : "MONTH") {
            case "DAY":
                return now;
            case "WEEK":
                return now.minusWeeks(1);
            case "MONTH":
                return now.minusMonths(1);
            case "YEAR":
                return now.minusYears(1);
            default:
                return now.minusMonths(1);
        }
    }

    private AnalyticsResponse.OverviewData getOverviewData(List<Order> orders, LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusWeeks(1);
        LocalDate monthStart = today.minusMonths(1);
        LocalDate mtdStart = today.withDayOfMonth(1);
        LocalDate ytdStart = today.withDayOfYear(1);

        BigDecimal revenueToday = orders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().equals(today))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal revenueWeek = orders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().isAfter(weekStart.minusDays(1)))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal revenueMonth = orders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().isAfter(monthStart.minusDays(1)))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal revenueMTD = orders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().isAfter(mtdStart.minusDays(1)))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal revenueYTD = orders.stream()
                .filter(o -> o.getCreatedAt().toLocalDate().isAfter(ytdStart.minusDays(1)))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long ordersCount = orders.size();
        BigDecimal aov = ordersCount > 0 
                ? revenueMonth.divide(BigDecimal.valueOf(ordersCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        long activeUsers = orders.stream()
                .map(Order::getCustomer)
                .map(Customer::getCustomerId)
                .distinct()
                .count();

        BigDecimal refundsAmount = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal returnsAmount = refundsAmount; // Simplified - same as refunds

        List<AnalyticsResponse.TimeSeriesPoint> revenueTrend = getRevenueTrend(orders, startDate, endDate);
        List<AnalyticsResponse.TimeSeriesPoint> ordersTrend = getOrdersTrend(orders, startDate, endDate);

        return AnalyticsResponse.OverviewData.builder()
                .revenueToday(revenueToday)
                .revenueWeek(revenueWeek)
                .revenueMonth(revenueMonth)
                .revenueMTD(revenueMTD)
                .revenueYTD(revenueYTD)
                .ordersCount(ordersCount)
                .averageOrderValue(aov)
                .conversionRate(0.0) // Would need session data
                .activeUsers(activeUsers)
                .refundsAmount(refundsAmount)
                .returnsAmount(returnsAmount)
                .revenueTrend(revenueTrend)
                .ordersTrend(ordersTrend)
                .build();
    }

    private AnalyticsResponse.SalesData getSalesData(List<Order> orders) {
        BigDecimal totalSales = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netSales = orders.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<AnalyticsResponse.TimeSeriesPoint> salesByDay = getSalesByDay(orders);
        List<AnalyticsResponse.HourlySales> salesByHour = getSalesByHour(orders);
        List<AnalyticsResponse.TopProduct> topProducts = getTopProductsByRevenue(orders);

        return AnalyticsResponse.SalesData.builder()
                .totalSales(totalSales)
                .netSales(netSales)
                .salesByDay(salesByDay)
                .salesByHour(salesByHour)
                .topProductsByRevenue(topProducts)
                .build();
    }

    private AnalyticsResponse.OrdersData getOrdersData(List<Order> orders) {
        long totalOrders = orders.size();
        
        Map<String, Long> ordersByStatus = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStatus().name(),
                        Collectors.counting()
                ));

        List<Order> deliveredOrders = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        double avgTimeToShip = deliveredOrders.stream()
                .filter(o -> o.getArrivingDate() != null)
                .mapToLong(o -> ChronoUnit.DAYS.between(
                        o.getCreatedAt().toLocalDate(),
                        o.getArrivingDate()))
                .average()
                .orElse(0.0);

        List<AnalyticsResponse.StatusDistribution> statusDistribution = ordersByStatus.entrySet().stream()
                .map(e -> AnalyticsResponse.StatusDistribution.builder()
                        .status(e.getKey())
                        .count(e.getValue())
                        .percentage(BigDecimal.valueOf(e.getValue() * 100.0 / totalOrders)
                                .setScale(2, RoundingMode.HALF_UP))
                        .build())
                .collect(Collectors.toList());

        AnalyticsResponse.FunnelData funnel = AnalyticsResponse.FunnelData.builder()
                .cartSessions(0L) // Would need session data
                .checkoutSessions(0L)
                .paidOrders((long) orders.size())
                .shippedOrders((long) deliveredOrders.size())
                .cartToCheckoutRate(0.0)
                .checkoutToPaidRate(0.0)
                .paidToShippedRate(deliveredOrders.size() > 0 
                        ? (double) deliveredOrders.size() / orders.size() * 100 
                        : 0.0)
                .build();

        return AnalyticsResponse.OrdersData.builder()
                .totalOrders(totalOrders)
                .ordersByStatus(ordersByStatus)
                .averageTimeToShip(avgTimeToShip)
                .fulfillmentSlaBreaches(0L) // Would need SLA data
                .statusDistribution(statusDistribution)
                .conversionFunnel(funnel)
                .build();
    }

    private AnalyticsResponse.ProductsData getProductsData(List<Order> orders) {
        Map<String, ProductStats> productStats = new HashMap<>();
        
        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            for (OrderItem item : items) {
                String productId = item.getProduct().getProductId();
                ProductStats stats = productStats.getOrDefault(productId, new ProductStats());
                stats.productId = productId;
                stats.productName = item.getProductName();
                stats.revenue = stats.revenue.add(item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())));
                stats.quantity += item.getQuantity();
                productStats.put(productId, stats);
            }
        }

        List<AnalyticsResponse.TopProduct> topByRevenue = productStats.values().stream()
                .sorted((a, b) -> b.revenue.compareTo(a.revenue))
                .limit(10)
                .map(ps -> AnalyticsResponse.TopProduct.builder()
                        .productId(ps.productId)
                        .productName(ps.productName)
                        .revenue(ps.revenue)
                        .quantitySold(ps.quantity)
                        .price(ps.revenue.divide(BigDecimal.valueOf(ps.quantity), 2, RoundingMode.HALF_UP))
                        .build())
                .collect(Collectors.toList());

        List<AnalyticsResponse.TopProduct> topByQuantity = productStats.values().stream()
                .sorted((a, b) -> Long.compare(b.quantity, a.quantity))
                .limit(10)
                .map(ps -> AnalyticsResponse.TopProduct.builder()
                        .productId(ps.productId)
                        .productName(ps.productName)
                        .revenue(ps.revenue)
                        .quantitySold(ps.quantity)
                        .price(ps.revenue.divide(BigDecimal.valueOf(ps.quantity), 2, RoundingMode.HALF_UP))
                        .build())
                .collect(Collectors.toList());

        List<Product> allProducts = productRepository.findAll();
        List<AnalyticsResponse.LowStockProduct> lowStock = allProducts.stream()
                .filter(p -> p.getQuantityAvailable() < 10)
                .map(p -> AnalyticsResponse.LowStockProduct.builder()
                        .productId(p.getProductId())
                        .productName(p.getName())
                        .quantityAvailable(p.getQuantityAvailable())
                        .threshold(10)
                        .build())
                .collect(Collectors.toList());

        return AnalyticsResponse.ProductsData.builder()
                .topSellersByRevenue(topByRevenue)
                .topSellersByQuantity(topByQuantity)
                .lowStockProducts(lowStock)
                .totalStockouts((long) allProducts.stream()
                        .filter(p -> p.getQuantityAvailable() == 0)
                        .count())
                .build();
    }

    private AnalyticsResponse.CustomersData getCustomersData(List<Order> orders, LocalDate startDate, LocalDate endDate) {
        Set<String> customerIds = orders.stream()
                .map(o -> o.getCustomer().getCustomerId())
                .collect(Collectors.toSet());

        long newCustomers = customerRepository.findAll().stream()
                .filter(c -> c.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)))
                .filter(c -> c.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1)))
                .count();

        long returningCustomers = customerIds.size();

        Map<String, BigDecimal> customerRevenue = new HashMap<>();
        for (Order order : orders) {
            String custId = order.getCustomer().getCustomerId();
            customerRevenue.merge(custId, order.getTotalAmount(), BigDecimal::add);
        }

        BigDecimal avgLTV = customerRevenue.isEmpty() 
                ? BigDecimal.ZERO
                : customerRevenue.values().stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(customerRevenue.size()), 2, RoundingMode.HALF_UP);

        return AnalyticsResponse.CustomersData.builder()
                .newCustomers(newCustomers)
                .returningCustomers(returningCustomers)
                .averageLTV(avgLTV)
                .cohortRetention(new ArrayList<>()) // Simplified
                .rfmSegments(new ArrayList<>()) // Simplified
                .build();
    }

    private AnalyticsResponse.PaymentsData getPaymentsData(List<Order> orders) {
        List<PaymentAttempt> attempts = paymentAttemptRepository.findAll();
        
        long successful = attempts.stream()
                .filter(pa -> pa.getStatus() == PaymentAttempt.PaymentStatus.SUCCESS)
                .count();
        
        long total = attempts.size();
        double successRate = total > 0 ? (double) successful / total * 100 : 0.0;

        return AnalyticsResponse.PaymentsData.builder()
                .successRate(successRate)
                .failedPayments(total - successful)
                .chargebacks(0L) // Would need chargeback data
                .fraudFlags(0L) // Would need fraud data
                .averageProcessingTime(0.0) // Would need timing data
                .paymentTrend(new ArrayList<>())
                .build();
    }

    private AnalyticsResponse.ReturnsData getReturnsData(List<Order> orders) {
        List<Order> cancelled = orders.stream()
                .filter(o -> o.getStatus() == Order.OrderStatus.CANCELLED)
                .collect(Collectors.toList());

        double returnRate = orders.isEmpty() 
                ? 0.0 
                : (double) cancelled.size() / orders.size() * 100;

        BigDecimal refundAmount = cancelled.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> reasons = cancelled.stream()
                .filter(o -> o.getCancellationReason() != null)
                .collect(Collectors.groupingBy(
                        Order::getCancellationReason,
                        Collectors.counting()
                ));

        return AnalyticsResponse.ReturnsData.builder()
                .returnRate(returnRate)
                .refundAmount(refundAmount)
                .reasonsDistribution(reasons)
                .averageTimeToRefund(0.0) // Would need refund timing data
                .topReturnedProducts(new ArrayList<>()) // Simplified
                .build();
    }

    private List<AnalyticsResponse.TimeSeriesPoint> getRevenueTrend(List<Order> orders, LocalDate start, LocalDate end) {
        Map<LocalDate, BigDecimal> daily = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)
                ));

        return daily.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> AnalyticsResponse.TimeSeriesPoint.builder()
                        .date(e.getKey().toString())
                        .value(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AnalyticsResponse.TimeSeriesPoint> getOrdersTrend(List<Order> orders, LocalDate start, LocalDate end) {
        Map<LocalDate, Long> daily = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().toLocalDate(),
                        Collectors.counting()
                ));

        return daily.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> AnalyticsResponse.TimeSeriesPoint.builder()
                        .date(e.getKey().toString())
                        .count(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AnalyticsResponse.TimeSeriesPoint> getSalesByDay(List<Order> orders) {
        return getRevenueTrend(orders, LocalDate.now().minusDays(30), LocalDate.now());
    }

    private List<AnalyticsResponse.HourlySales> getSalesByHour(List<Order> orders) {
        Map<Integer, BigDecimal> hourly = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt().getHour(),
                        Collectors.reducing(BigDecimal.ZERO, Order::getTotalAmount, BigDecimal::add)
                ));

        return hourly.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> AnalyticsResponse.HourlySales.builder()
                        .hour(e.getKey())
                        .amount(e.getValue())
                        .count(orders.stream()
                                .filter(o -> o.getCreatedAt().getHour() == e.getKey())
                                .count())
                        .build())
                .collect(Collectors.toList());
    }

    private List<AnalyticsResponse.TopProduct> getTopProductsByRevenue(List<Order> orders) {
        Map<String, ProductStats> productStats = new HashMap<>();
        
        for (Order order : orders) {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            for (OrderItem item : items) {
                String productId = item.getProduct().getProductId();
                ProductStats stats = productStats.getOrDefault(productId, new ProductStats());
                stats.productId = productId;
                stats.productName = item.getProductName();
                stats.revenue = stats.revenue.add(item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())));
                stats.quantity += item.getQuantity();
                productStats.put(productId, stats);
            }
        }

        return productStats.values().stream()
                .sorted((a, b) -> b.revenue.compareTo(a.revenue))
                .limit(10)
                .map(ps -> AnalyticsResponse.TopProduct.builder()
                        .productId(ps.productId)
                        .productName(ps.productName)
                        .revenue(ps.revenue)
                        .quantitySold(ps.quantity)
                        .price(ps.revenue.divide(BigDecimal.valueOf(ps.quantity), 2, RoundingMode.HALF_UP))
                        .build())
                .collect(Collectors.toList());
    }

    private static class ProductStats {
        String productId;
        String productName;
        BigDecimal revenue = BigDecimal.ZERO;
        long quantity = 0;
    }
}

