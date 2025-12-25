import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-customer-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="feedback-container">
      <app-navbar [role]="'customer'" [userName]="customerName" (signOut)="logout()"></app-navbar>

      <div class="content">
        <div class="container">
          <div *ngIf="!showSuccess" class="feedback-form-section">
            <h1 class="page-title">Add Feedback</h1>
            <p class="subtitle">Share your experience with the products from this order</p>

            <div *ngIf="order" class="order-info-box">
              <h3>Order Information</h3>
              <div class="info-row">
                <span class="label">Order ID:</span>
                <span class="value">{{order.orderId}}</span>
              </div>
              <div class="info-row">
                <span class="label">Order Date:</span>
                <span class="value">{{order.createdAt | date:'medium'}}</span>
              </div>
            </div>

            <div *ngIf="order && order.items && order.items.length > 0" class="products-section">
              <h3>Select Product to Review</h3>
              <div class="product-list">
                <div 
                  *ngFor="let item of order.items" 
                  class="product-item"
                  [class.selected]="selectedProductId === item.productId"
                  (click)="selectProduct(item)">
                  <div class="product-info">
                    <h4>{{item.productName}}</h4>
                    <p class="product-details">Category: {{item.category}} | Quantity: {{item.quantity}}</p>
                    <p class="product-price">Price: {{'$' + item.unitPrice}}</p>
                  </div>
                  <div class="product-check">
                    <span *ngIf="selectedProductId === item.productId" class="check-icon">✓</span>
                  </div>
                </div>
              </div>
            </div>

            <form *ngIf="selectedProductId" (ngSubmit)="submitFeedback()" class="feedback-form">
              <div class="form-group">
                <label for="rating">Rating *</label>
                <div class="rating-input">
                  <button 
                    type="button"
                    *ngFor="let star of [1,2,3,4,5]" 
                    (click)="rating = star"
                    class="star-btn"
                    [class.active]="rating >= star">
                    ⭐
                  </button>
                  <span class="rating-text">{{rating > 0 ? rating + ' out of 5' : 'Select rating'}}</span>
                </div>
              </div>

              <div class="form-group">
                <label for="description">Review Description</label>
                <textarea 
                  id="description" 
                  [(ngModel)]="description" 
                  name="description"
                  class="form-textarea"
                  placeholder="Share your experience with this product (max 500 characters)"
                  rows="6"
                  maxlength="500"></textarea>
                <div class="char-count">{{description.length}}/500</div>
              </div>

              <div class="form-actions">
                <button type="button" (click)="goBack()" class="btn secondary">Back to Orders</button>
                <button type="submit" class="btn primary" [disabled]="!rating || rating < 1 || rating > 5">
                  Submit Feedback
                </button>
              </div>
            </form>

            <div *ngIf="!selectedProductId && order" class="select-product-message">
              <p>Please select a product from the order to provide feedback.</p>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              {{errorMessage}}
            </div>
          </div>

          <div *ngIf="showSuccess" class="success-section">
            <div class="success-box">
              <div class="success-icon">✓</div>
              <h2>Feedback Submitted Successfully</h2>
              <p class="success-message">Thank you for your feedback! Your review will help other customers make informed decisions.</p>
              
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
    .feedback-container { min-height: 100vh; background: #EAEDED; }
    .content { padding: 30px 20px; }
    .container { max-width: 900px; margin: 0 auto; }
    .page-title { font-size: 28px; font-weight: 400; margin-bottom: 10px; color: #111; }
    .subtitle { font-size: 14px; color: #767676; margin-bottom: 30px; }
    .feedback-form-section { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .order-info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .order-info-box h3 { font-size: 18px; margin-bottom: 15px; color: #111; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e7e7e7; }
    .info-row:last-child { border-bottom: none; }
    .label { font-size: 14px; color: #767676; }
    .value { font-size: 14px; font-weight: 500; color: #111; }
    .products-section { margin-bottom: 30px; }
    .products-section h3 { font-size: 18px; margin-bottom: 15px; color: #111; }
    .product-list { display: flex; flex-direction: column; gap: 12px; }
    .product-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .product-item:hover { border-color: #FF9900; background: #fff8f0; }
    .product-item.selected { border-color: #FF9900; background: #fff8f0; }
    .product-info { flex: 1; }
    .product-info h4 { font-size: 16px; font-weight: 600; color: #0066c0; margin-bottom: 5px; }
    .product-details { font-size: 13px; color: #767676; margin: 3px 0; }
    .product-price { font-size: 14px; font-weight: 600; color: #B12704; }
    .product-check { width: 30px; text-align: center; }
    .check-icon { font-size: 24px; color: #28a745; }
    .feedback-form { margin-top: 20px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; color: #111; margin-bottom: 8px; }
    .rating-input { display: flex; align-items: center; gap: 10px; }
    .star-btn { background: none; border: none; font-size: 32px; cursor: pointer; padding: 0; transition: transform 0.2s; }
    .star-btn:hover { transform: scale(1.2); }
    .star-btn.active { filter: none; }
    .star-btn:not(.active) { filter: grayscale(100%); opacity: 0.3; }
    .rating-text { font-size: 14px; color: #767676; margin-left: 10px; }
    .form-textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; font-family: inherit; resize: vertical; }
    .form-textarea:focus { outline: none; border-color: #FF9900; }
    .char-count { font-size: 12px; color: #767676; text-align: right; margin-top: 5px; }
    .form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px; }
    .select-product-message { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin-top: 20px; }
    .select-product-message p { margin: 0; color: #856404; }
    .error-message { background: #f8d7da; color: #721c24; padding: 12px; border-radius: 4px; margin-top: 15px; }
    .btn { padding: 12px 24px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn.primary { background: #FF9900; border-color: #FF9900; color: white; }
    .btn.primary:hover:not(:disabled) { background: #FFB84D; }
    .btn.secondary { background: white; color: #111; }
    .btn.secondary:hover { background: #f5f5f5; }
    .success-section { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .success-box { text-align: center; }
    .success-icon { font-size: 64px; color: #28a745; margin-bottom: 20px; }
    .success-box h2 { font-size: 24px; color: #111; margin-bottom: 10px; }
    .success-message { font-size: 16px; color: #767676; margin-bottom: 30px; }
    .success-actions { display: flex; gap: 15px; justify-content: center; margin-top: 30px; }
  `]
})
export class CustomerFeedbackComponent implements OnInit {
  orderId = '';
  order: any = null;
  selectedProductId = '';
  selectedProduct: any = null;
  rating = 0;
  description = '';
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
    
    this.route.params.subscribe(params => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        this.loadOrder();
      }
    });

  }

  loadOrder() {
    this.orderService.getOrder(this.orderId).subscribe({
      next: (order) => {
        if (order.status !== 'DELIVERED') {
          this.errorMessage = 'Feedback can only be provided for delivered orders.';
        } else {
          this.order = order;
          // Check if productId is in query params and auto-select
          this.route.queryParams.subscribe(params => {
            if (params['productId'] && order.items) {
              const product = order.items.find((item: any) => item.productId === params['productId']);
              if (product) {
                this.selectProduct(product);
              }
            }
          });
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error loading order.';
      }
    });
  }

  selectProduct(item: any) {
    this.selectedProductId = item.productId;
    this.selectedProduct = item;
    this.rating = 0;
    this.description = '';
  }

  submitFeedback() {
    if (!this.rating || this.rating < 1 || this.rating > 5) {
      this.errorMessage = 'Please select a rating between 1 and 5.';
      return;
    }

    this.errorMessage = '';
    this.orderService.submitFeedback(
      this.orderId,
      this.selectedProductId,
      this.rating,
      this.description || ''
    ).subscribe({
      next: () => {
        this.showSuccess = true;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error submitting feedback.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/customer/orders']);
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

