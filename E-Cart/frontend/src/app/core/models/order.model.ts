import { ProductCategory } from './product.model';

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  arrivingDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  addressSnapshot?: string;
  paymentMode: PaymentMode;
  transactionId?: string;
  invoiceId?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  unitPrice: number;
  quantity: number;
  description?: string;
}

export enum OrderStatus {
  CONFIRMED = 'CONFIRMED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMode {
  CREDIT_CARD = 'CREDIT_CARD',
  UPI = 'UPI'
}

