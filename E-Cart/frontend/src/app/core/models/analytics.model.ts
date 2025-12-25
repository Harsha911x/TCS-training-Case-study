export interface AnalyticsData {
  overview?: OverviewData;
  sales?: SalesData;
  orders?: OrdersData;
  products?: ProductsData;
  customers?: CustomersData;
  payments?: PaymentsData;
  returns?: ReturnsData;
}

export interface OverviewData {
  revenueToday?: number;
  revenueWeek?: number;
  revenueMonth?: number;
  revenueMTD?: number;
  revenueYTD?: number;
  ordersCount?: number;
  averageOrderValue?: number;
  conversionRate?: number;
  activeUsers?: number;
  refundsAmount?: number;
  returnsAmount?: number;
  revenueTrend?: TimeSeriesPoint[];
  ordersTrend?: TimeSeriesPoint[];
}

export interface SalesData {
  totalSales?: number;
  netSales?: number;
  salesByDay?: TimeSeriesPoint[];
  salesByHour?: HourlySales[];
  topProductsByRevenue?: TopProduct[];
}

export interface OrdersData {
  totalOrders?: number;
  ordersByStatus?: { [key: string]: number };
  averageTimeToShip?: number;
  fulfillmentSlaBreaches?: number;
  statusDistribution?: StatusDistribution[];
  conversionFunnel?: FunnelData;
}

export interface ProductsData {
  topSellersByRevenue?: TopProduct[];
  topSellersByQuantity?: TopProduct[];
  lowStockProducts?: LowStockProduct[];
  totalStockouts?: number;
}

export interface CustomersData {
  newCustomers?: number;
  returningCustomers?: number;
  averageLTV?: number;
  cohortRetention?: CohortData[];
  rfmSegments?: RFMSegment[];
}

export interface PaymentsData {
  successRate?: number;
  failedPayments?: number;
  chargebacks?: number;
  fraudFlags?: number;
  averageProcessingTime?: number;
  paymentTrend?: TimeSeriesPoint[];
}

export interface ReturnsData {
  returnRate?: number;
  refundAmount?: number;
  reasonsDistribution?: { [key: string]: number };
  averageTimeToRefund?: number;
  topReturnedProducts?: TopReturnedProduct[];
}

export interface TimeSeriesPoint {
  date?: string;
  value?: number;
  count?: number;
}

export interface HourlySales {
  hour?: number;
  amount?: number;
  count?: number;
}

export interface TopProduct {
  productId?: string;
  productName?: string;
  revenue?: number;
  quantitySold?: number;
  price?: number;
}

export interface StatusDistribution {
  status?: string;
  count?: number;
  percentage?: number;
}

export interface FunnelData {
  cartSessions?: number;
  checkoutSessions?: number;
  paidOrders?: number;
  shippedOrders?: number;
  cartToCheckoutRate?: number;
  checkoutToPaidRate?: number;
  paidToShippedRate?: number;
}

export interface LowStockProduct {
  productId?: string;
  productName?: string;
  quantityAvailable?: number;
  threshold?: number;
}

export interface CohortData {
  cohort?: string;
  customers?: number;
  retentionRate?: number;
}

export interface RFMSegment {
  segment?: string;
  customers?: number;
  averageLTV?: number;
}

export interface TopReturnedProduct {
  productId?: string;
  productName?: string;
  returnCount?: number;
  refundAmount?: number;
}

