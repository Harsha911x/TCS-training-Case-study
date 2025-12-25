import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { Page } from '../../../core/models/page.model';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="orders-container">
      <app-navbar [role]="'customer'" [userName]="customerName" [cartCount]="cartItemCount" (signOut)="logout()"></app-navbar>

      <div class="orders-content">
        <div class="container">
          <h1 class="page-title">Your Orders</h1>
          
          <div class="filters-section">
            <div class="filter-group">
              <label>Filter by Status:</label>
              <select [(ngModel)]="selectedStatus" (change)="loadOrders()" class="filter-select">
                <option value="">All Orders</option>
                <option *ngFor="let status of statuses" [value]="status">{{status}}</option>
              </select>
            </div>
          </div>

          <div *ngIf="orders && orders.content.length > 0; else noOrders" class="orders-list">
            <div *ngFor="let order of orders.content" class="order-card">
              <div class="order-header">
                <div class="order-info">
                  <div class="order-id-section">
                    <span class="order-label">Order ID:</span>
                    <span class="order-id">{{order.orderId}}</span>
                  </div>
                  <div class="order-date">
                    <span class="date-label">Ordered on:</span>
                    <span>{{order.createdAt | date:'medium'}}</span>
                  </div>
                </div>
                <div class="order-status">
                  <span class="status-badge" [class.status-confirmed]="order.status === 'CONFIRMED'"
                        [class.status-delivered]="order.status === 'DELIVERED'"
                        [class.status-cancelled]="order.status === 'CANCELLED'">
                    <span class="status-icon" *ngIf="order.status === 'CONFIRMED'">✓</span>
                    <span class="status-icon" *ngIf="order.status === 'DELIVERED'">🚚</span>
                    <span class="status-icon" *ngIf="order.status === 'CANCELLED'">✗</span>
                    {{order.status}}
                  </span>
                </div>
              </div>

              <div class="order-items">
                <div *ngFor="let item of order.items" class="order-item">
                  <div class="item-info">
                    <h3 class="item-name">{{item.productName}}</h3>
                    <p class="item-details">Category: {{item.category}}</p>
                    <p class="item-details">Quantity: {{item.quantity}}</p>
                    <p class="item-details">Product ID: {{item.productId}}</p>
                  </div>
                  <div class="item-right">
                    <div class="item-price">
                      <span class="price">{{ '₹' + (item.unitPrice * item.quantity).toFixed(2) }}</span>
                    </div>
                    <button *ngIf="order.status === 'DELIVERED'" 
                            [routerLink]="['/customer/feedback', order.orderId]" 
                            [queryParams]="{productId: item.productId}"
                            class="item-feedback-btn">
                      <span>⭐</span>
                      <span>Add Feedback</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span class="total-label">Order Total:</span>
                  <span class="total-value">{{ '₹' + order.totalAmount }}</span>
                </div>
                <div class="order-actions">
                  <button *ngIf="order.status === 'CONFIRMED'" 
                          [routerLink]="['/customer/orders/cancel']" 
                          [queryParams]="{orderId: order.orderId}"
                          class="action-btn cancel-btn">
                    <span>❌</span>
                    <span>Cancel Order</span>
                  </button>
                  <button *ngIf="order.invoiceId" (click)="downloadInvoice(order.orderId)" 
                          class="action-btn invoice-btn">
                    <span>📄</span>
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noOrders>
            <div class="no-orders">
              <div class="no-orders-icon">📦</div>
              <h2>No orders found</h2>
              <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <a routerLink="/customer/home" class="shop-btn">Continue Shopping</a>
            </div>
          </ng-template>

          <div class="pagination" *ngIf="orders && orders.totalPages > 1">
            <button (click)="previousPage()" [disabled]="currentPage === 0" 
                    class="pagination-btn" [class.disabled]="currentPage === 0">
              ← Previous
            </button>
            <span class="page-info">Page {{currentPage + 1}} of {{orders.totalPages}}</span>
            <button (click)="nextPage()" [disabled]="currentPage >= orders.totalPages - 1" 
                    class="pagination-btn" [class.disabled]="currentPage >= orders.totalPages - 1">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container { min-height: 100vh; background: #EAEDED; }
    .orders-content { padding: 30px 20px; }
    .container { max-width: 1400px; margin: 0 auto; }
    .page-title { font-size: 28px; font-weight: 400; margin-bottom: 20px; color: #111; }
    .filters-section { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .filter-group { display: flex; align-items: center; gap: 15px; }
    .filter-group label { font-size: 14px; font-weight: 600; color: #111; }
    .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; min-width: 200px; }
    .orders-list { display: flex; flex-direction: column; gap: 20px; }
    .order-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e7e7e7; }
    .order-info { display: flex; flex-direction: column; gap: 8px; }
    .order-id-section { display: flex; align-items: center; gap: 10px; }
    .order-label { font-size: 14px; color: #767676; }
    .order-id { font-size: 16px; font-weight: 600; color: #0066c0; }
    .order-date { font-size: 14px; color: #767676; }
    .date-label { font-weight: 600; margin-right: 5px; }
    .status-badge { padding: 8px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
    .status-icon { font-size: 14px; }
    .status-confirmed { background: #d4edda; color: #155724; }
    .status-delivered { background: #cce5ff; color: #004085; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    .order-items { margin-bottom: 20px; }
    .order-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f0f0f0; }
    .order-item:last-child { border-bottom: none; }
    .item-info { flex: 1; }
    .item-name { font-size: 16px; font-weight: 500; color: #0066c0; margin-bottom: 5px; }
    .item-details { font-size: 14px; color: #767676; margin: 3px 0; }
    .item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .item-price { display: flex; align-items: center; }
    .price { font-size: 16px; font-weight: 600; color: #B12704; }
    .item-feedback-btn { padding: 6px 12px; background: #FF9900; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 4px; transition: background 0.2s; }
    .item-feedback-btn:hover { background: #FFB84D; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 2px solid #e7e7e7; }
    .order-total { display: flex; align-items: center; gap: 10px; }
    .total-label { font-size: 16px; font-weight: 600; color: #111; }
    .total-value { font-size: 20px; font-weight: 700; color: #B12704; }
    .order-actions { display: flex; gap: 10px; }
    .action-btn { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
    .cancel-btn { background: white; color: #c40000; border-color: #c40000; }
    .cancel-btn:hover { background: #fff4f4; }
    .feedback-btn { background: #FF9900; color: white; border-color: #FF9900; }
    .feedback-btn:hover { background: #FFB84D; }
    .invoice-btn { background: white; color: #0066c0; border-color: #0066c0; }
    .invoice-btn:hover { background: #f0f8ff; }
    .no-orders { text-align: center; padding: 60px 20px; background: white; border-radius: 8px; }
    .no-orders-icon { font-size: 64px; margin-bottom: 20px; }
    .no-orders h2 { font-size: 24px; margin-bottom: 10px; color: #111; }
    .no-orders p { font-size: 16px; color: #767676; margin-bottom: 20px; }
    .shop-btn { display: inline-block; padding: 12px 30px; background: #FF9900; color: white; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500; }
    .shop-btn:hover { background: #FFB84D; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 30px; }
    .pagination-btn { padding: 10px 20px; background: white; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
    .pagination-btn:hover:not(.disabled) { background: #f5f5f5; border-color: #FF9900; }
    .pagination-btn.disabled { opacity: 0.5; cursor: not-allowed; }
    .page-info { font-size: 14px; color: #555; }

    @media (max-width: 768px) {
      .order-header { flex-direction: column; gap: 10px; }
      .order-footer { flex-direction: column; gap: 15px; align-items: flex-start; }
      .order-actions { width: 100%; flex-direction: column; }
      .action-btn { width: 100%; text-align: center; }
    }
  `]
})
export class OrdersComponent implements OnInit {
  orders: Page<Order> | null = null;
  selectedStatus = '';
  statuses = Object.values(OrderStatus);
  currentPage = 0;
  pageSize = 10;
  customerName = '';
  cartItemCount = 0;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.customerName = user?.customerName || '';
    this.loadCartCount();
    this.loadOrders();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paymentSuccess') === 'true') {
      setTimeout(() => {
        this.showSuccessMessage('Order placed successfully! Your order is now confirmed.');
      }, 500);
      this.router.navigate([], { queryParams: {} });
    }
  }

  loadCartCount() {
    this.cartService.getCart().subscribe({
      next: (data) => {
        let totalCartItems = 0;
        for (let i of data.items) {
          totalCartItems += i.quantity;
        }
        this.cartItemCount = totalCartItems;
      },
      error: (err) => {
        console.error('Error loading cart count:', err);
      }
    });
  }

  showSuccessMessage(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.innerHTML = `<strong>✓ ${message}</strong>`;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }

  loadOrders() {
    this.orderService.getOrders(
      this.selectedStatus as OrderStatus || undefined,
      undefined,
      undefined,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
      }
    });
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadOrders();
    }
  }

  nextPage() {
    if (this.orders && this.currentPage < this.orders.totalPages - 1) {
      this.currentPage++;
      this.loadOrders();
    }
  }


  downloadInvoice(orderId: string) {
    this.orderService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Error downloading invoice');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
