import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-cancel-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="cancel-order-container">
      <app-navbar [role]="'customer'" [userName]="customerName" (signOut)="logout()"></app-navbar>

      <div class="content">
        <div class="container">
          <div *ngIf="!orderFound && !showSuccess" class="search-section">
            <h1 class="page-title">Cancel Order</h1>
            <p class="subtitle">Enter your Order ID to search for the order you want to cancel</p>

            <div class="form-section">
              <div class="form-group">
                <label for="orderId">Order ID *</label>
                <input 
                  type="text" 
                  id="orderId" 
                  [(ngModel)]="orderId" 
                  class="form-input"
                  placeholder="Enter Order ID"
                  (keyup.enter)="searchOrder()">
              </div>
              <button (click)="searchOrder()" class="btn primary" [disabled]="!orderId">Search Order</button>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              {{errorMessage}}
            </div>
          </div>

          <div *ngIf="orderFound && !showSuccess && order" class="cancel-form-section">
            <h1 class="page-title">Cancel Order</h1>
            
            <div class="order-details-box">
              <h3>Order Details</h3>
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span class="value">{{order.orderId}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Order Date:</span>
                <span class="value">{{order.createdAt | date:'medium'}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value status-badge" [class.status-confirmed]="order.status === 'CONFIRMED'">{{order.status}}</span>
              </div>
              <div class="detail-row">
                <span class="label">Total Amount:</span>
                <span class="value amount">{{'₹' + order.totalAmount}}</span>
              </div>
            </div>

            <div class="confirmation-box">
              <p class="confirmation-text">
                <strong>Are you sure you want to cancel your order for {{order.orderId}}?</strong>
              </p>
            </div>

            <form (ngSubmit)="submitCancellation()" class="cancel-form">
              <div class="form-group">
                <label for="reason">Cancellation Reason *</label>
                <textarea 
                  id="reason" 
                  [(ngModel)]="reason" 
                  name="reason"
                  class="form-textarea"
                  placeholder="Please provide a reason for cancellation (max 500 characters)"
                  rows="5"
                  maxlength="500"
                  required></textarea>
                <div class="char-count">{{reason.length}}/500</div>
              </div>

              <div class="form-actions">
                <button type="button" (click)="goBack()" class="btn secondary">Back</button>
                <button type="submit" class="btn danger" [disabled]="!reason || reason.trim().length === 0">
                  Cancel Order
                </button>
              </div>
            </form>
          </div>

          <div *ngIf="showSuccess && cancelledOrder" class="success-section">
            <div class="success-box">
              <div class="success-icon">✓</div>
              <h2>Order Cancelled Successfully</h2>
              <p class="success-message">Your order has been cancelled successfully.</p>
              
              <div class="order-summary">
                <h3>Order Details</h3>
                <div class="summary-row">
                  <span class="label">Order ID:</span>
                  <span class="value">{{cancelledOrder.orderId}}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Cancellation Date:</span>
                  <span class="value">{{cancelledOrder.cancelledDate | date:'medium'}}</span>
                </div>
                <div class="summary-row">
                  <span class="label">Total Amount:</span>
                  <span class="value amount">{{'₹' + cancelledOrder.totalAmount}}</span>
                </div>
                <div class="summary-row" *ngIf="cancelledOrder.cancellationReason">
                  <span class="label">Reason:</span>
                  <span class="value">{{cancelledOrder.cancellationReason}}</span>
                </div>
              </div>

              <div class="refund-notice">
                <p class="refund-message">
                  <strong>💰 The amount will be refunded to your account in 5 working days.</strong>
                </p>
              </div>

              <div class="success-actions">
                <button (click)="goToOrders()" class="btn primary">View All Orders</button>
                <button (click)="goToHome()" class="btn secondary">Continue Shopping</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cancel-order-container { min-height: 100vh; background: #EAEDED; }
    .content { padding: 30px 20px; }
    .container { max-width: 800px; margin: 0 auto; }
    .page-title { font-size: 28px; font-weight: 400; margin-bottom: 10px; color: #111; }
    .subtitle { font-size: 14px; color: #767676; margin-bottom: 30px; }
    .search-section { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .form-section { display: flex; gap: 15px; align-items: flex-end; }
    .form-group { flex: 1; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; color: #111; margin-bottom: 8px; }
    .form-input, .form-textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit; }
    .form-input:focus, .form-textarea:focus { outline: none; border-color: #FF9900; }
    .form-textarea { resize: vertical; }
    .char-count { font-size: 12px; color: #767676; text-align: right; margin-top: 5px; }
    .btn { padding: 12px 24px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn.primary { background: #FF9900; border-color: #FF9900; color: white; }
    .btn.primary:hover:not(:disabled) { background: #FFB84D; }
    .btn.secondary { background: white; color: #111; }
    .btn.secondary:hover { background: #f5f5f5; }
    .btn.danger { background: #c40000; border-color: #c40000; color: white; }
    .btn.danger:hover:not(:disabled) { background: #8b0000; }
    .error-message { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 4px; margin-top: 15px; }
    .cancel-form-section { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .order-details-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .order-details-box h3 { font-size: 18px; margin-bottom: 15px; color: #111; }
    .detail-row, .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e7e7e7; }
    .detail-row:last-child, .summary-row:last-child { border-bottom: none; }
    .label { font-size: 14px; color: #767676; }
    .value { font-size: 14px; font-weight: 500; color: #111; }
    .value.amount { font-size: 16px; font-weight: 700; color: #B12704; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .status-confirmed { background: #d4edda; color: #155724; }
    .confirmation-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .confirmation-text { margin: 0; font-size: 16px; color: #856404; }
    .cancel-form { margin-top: 20px; }
    .form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 20px; }
    .success-section { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .success-box { text-align: center; }
    .success-icon { font-size: 64px; color: #28a745; margin-bottom: 20px; }
    .success-box h2 { font-size: 24px; color: #111; margin-bottom: 10px; }
    .success-message { font-size: 16px; color: #767676; margin-bottom: 30px; }
    .order-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
    .order-summary h3 { font-size: 18px; margin-bottom: 15px; color: #111; }
    .refund-notice { background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .refund-message { margin: 0; font-size: 16px; color: #155724; }
    .success-actions { display: flex; gap: 15px; justify-content: center; margin-top: 30px; }
  `]
})
export class CancelOrderComponent implements OnInit {
  orderId = '';
  reason = '';
  order: any = null;
  cancelledOrder: any = null;
  orderFound = false;
  showSuccess = false;
  errorMessage = '';
  customerName = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.customerName = user?.customerName || '';
    
    // Check if orderId is passed as query param
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.orderId = params['orderId'];
        this.searchOrder();
      }
    });
  }

  searchOrder() {
    if (!this.orderId) {
      this.errorMessage = 'Please enter an Order ID';
      return;
    }

    this.errorMessage = '';
    this.orderService.getOrder(this.orderId).subscribe({
      next: (order) => {
        if (order.status === 'IN_TRANSIT' || order.status === 'DELIVERED') {
          this.errorMessage = `Cannot cancel order with status: ${order.status}. Only CONFIRMED orders can be cancelled.`;
          this.orderFound = false;
        } else if (order.status === 'CANCELLED') {
          this.errorMessage = 'This order has already been cancelled.';
          this.orderFound = false;
        } else if (order.status === 'CONFIRMED') {
          this.order = order;
          this.orderFound = true;
        } else {
          this.errorMessage = 'Order not found or cannot be cancelled.';
          this.orderFound = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Order not found. Please check the Order ID.';
        this.orderFound = false;
      }
    });
  }

  submitCancellation() {
    if (!this.reason || this.reason.trim().length === 0) {
      return;
    }

    if (!confirm(`Are you sure you want to cancel your order for ${this.order.orderId}?`)) {
      return;
    }

    this.orderService.cancelOrder(this.order.orderId, this.reason).subscribe({
      next: (response) => {
        this.cancelledOrder = response.order;
        this.showSuccess = true;
        this.orderFound = false;
      },
      error: (err) => {
        alert(err.error?.message || 'Error cancelling order');
      }
    });
  }

  goBack() {
    this.orderFound = false;
    this.order = null;
    this.orderId = '';
    this.reason = '';
    this.errorMessage = '';
  }

  goToOrders() {
    this.router.navigate(['/customer/orders']);
  }

  goToHome() {
    this.router.navigate(['/customer/home']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

