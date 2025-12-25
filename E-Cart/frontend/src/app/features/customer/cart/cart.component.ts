import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService, Cart, CartItem } from '../../../core/services/cart.service';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="cart-container">
      <app-navbar [role]="'customer'" [userName]="customerName" [cartCount]="cartItemCount" (signOut)="logout()"></app-navbar>

      <div class="cart-content">
        <div class="container">
          <h1 class="page-title">Shopping Cart</h1>
          
          <div *ngIf="cart && cart.items.length > 0; else emptyCart" class="cart-layout">
            <div class="cart-items">
              <div class="cart-item-card" *ngFor="let item of cart.items; let i = index">
                <div class="item-info">
                  <h3 class="item-name">{{item.productName}}</h3>
                  <p class="item-id">Product ID: {{item.productId}}</p>
                  <p class="item-description">{{item.description}}</p>
                </div>
                <div class="item-details">
                  <div class="price-section">
                    <span class="price-label">Price:</span>
                    <span class="item-price">{{ '₹' + item.price }}</span>
                  </div>
                  <div class="quantity-section">
                    <label>Quantity:</label>
                    <div class="quantity-controls">
                      <button (click)="decreaseQuantity(item, i)" class="qty-btn">-</button>
                      <input type="number" [(ngModel)]="item.quantity" min="1" 
                             (change)="updateQuantity(item, i)" class="qty-input">
                      <button (click)="increaseQuantity(item, i)" class="qty-btn">+</button>
                    </div>
                  </div>
                  <div class="item-total">
                    <span class="total-label">Subtotal:</span>
                    <span class="total-value">{{ '₹' + (item.price * item.quantity).toFixed(2) }}</span>
                  </div>
                  <button (click)="removeItem(item.productId)" class="remove-btn">Delete</button>
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <div class="summary-card">
                <h2>Order Summary</h2>
                <div class="summary-row">
                  <span>Subtotal ({{cart.items.length}} items):</span>
                  <span>{{ '₹' + cart.total.toFixed(2) }}</span>
                </div>
                <div class="summary-row total-row">
                  <span><strong>Order Total:</strong></span>
                  <span class="order-total">{{ '₹' + cart.total.toFixed(2) }}</span>
                </div>
                <button (click)="checkout()" class="checkout-btn" [disabled]="isCheckingOut">
                  <span *ngIf="!isCheckingOut">Proceed to Buy</span>
                  <span *ngIf="isCheckingOut">Processing...</span>
                </button>
                <p class="cart-empty-message" *ngIf="cart.items.length === 0">
                  Cart is empty, please add products to check out
                </p>
              </div>
            </div>
          </div>

          <ng-template #emptyCart>
            <div class="empty-cart">
              <div class="empty-cart-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Add items to your cart to continue shopping</p>
              <a routerLink="/customer/home" class="continue-shopping-btn">Continue Shopping</a>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      min-height: 100vh;
      background: #EAEDED;
    }

    .cart-content {
      padding: 30px 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 20px;
      color: #111;
    }

    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 20px;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .cart-item-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      gap: 20px;
    }

    .item-info {
      flex: 1;
    }

    .item-name {
      font-size: 18px;
      font-weight: 500;
      color: #0066c0;
      margin-bottom: 8px;
    }

    .item-name:hover {
      text-decoration: underline;
      color: #c45500;
    }

    .item-id {
      font-size: 12px;
      color: #767676;
      margin-bottom: 5px;
    }

    .item-description {
      font-size: 14px;
      color: #555;
      margin-bottom: 10px;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 15px;
      min-width: 200px;
    }

    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price-label {
      font-size: 14px;
      color: #555;
    }

    .item-price {
      font-size: 18px;
      font-weight: 600;
      color: #B12704;
    }

    .quantity-section {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .quantity-section label {
      font-size: 14px;
      color: #555;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .qty-btn {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qty-btn:hover {
      background: #f5f5f5;
    }

    .qty-input {
      width: 60px;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
      text-align: center;
    }

    .item-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid #e7e7e7;
    }

    .total-label {
      font-size: 14px;
      font-weight: 600;
    }

    .total-value {
      font-size: 18px;
      font-weight: 600;
      color: #B12704;
    }

    .remove-btn {
      padding: 8px 15px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      color: #0066c0;
    }

    .remove-btn:hover {
      background: #e0e0e0;
    }

    .cart-summary {
      position: sticky;
      top: 80px;
      height: fit-content;
    }

    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .summary-card h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #111;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .total-row {
      border-top: 1px solid #e7e7e7;
      padding-top: 10px;
      margin-top: 10px;
    }

    .order-total {
      font-size: 18px;
      font-weight: 700;
      color: #B12704;
    }

    .checkout-btn {
      width: 100%;
      padding: 12px;
      background: #FFD814;
      border: none;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 15px;
      color: #111;
      transition: background 0.2s;
    }

    .checkout-btn:hover:not(:disabled) {
      background: #FCD200;
    }

    .checkout-btn:disabled {
      background: #e7e9ec;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .empty-cart {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
    }

    .empty-cart-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    .empty-cart h2 {
      font-size: 24px;
      margin-bottom: 10px;
      color: #111;
    }

    .empty-cart p {
      font-size: 16px;
      color: #767676;
      margin-bottom: 20px;
    }

    .continue-shopping-btn {
      display: inline-block;
      padding: 12px 30px;
      background: #FF9900;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
    }

    .continue-shopping-btn:hover {
      background: #FFB84D;
    }

    @media (max-width: 968px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: relative;
        top: 0;
      }
    }
  `]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  customerName = '';
  cartItemCount = 0;
  isCheckingOut = false;
  customerAddress: any = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.customerName = user?.customerName || '';
    this.loadCart();
    this.loadCustomerAddress();
    this.loadCartCount();
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

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cart = data;
        let totalCartItems = 0;
          for (let i of data.items) {
            totalCartItems += i.quantity;
          }
        this.cartItemCount = totalCartItems;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
      }
    });
  }

  loadCustomerAddress() {
    this.http.get('http://localhost:8080/api/customers/me').subscribe({
      next: (data: any) => {
        this.customerAddress = {
          name: data.name,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phoneNumber: data.phoneNumber
        };
      },
      error: (err) => {
        console.error('Error loading customer address:', err);
      }
    });
  }

  decreaseQuantity(item: CartItem, index: number) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateQuantity(item, index);
    }
  }

  increaseQuantity(item: CartItem, index: number) {
    item.quantity++;
    this.updateQuantity(item, index);
  }

  updateQuantity(item: CartItem, index: number) {
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    this.cartService.updateCartItem(item.productId, item.quantity).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => {
        alert(err.error?.message || 'Error updating cart');
        this.loadCart();
      }
    });
  }

  removeItem(productId: string) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      this.cartService.removeFromCart(productId).subscribe({
        next: () => {
          this.loadCart();
        },
        error: (err) => {
          alert(err.error?.message || 'Error removing item');
        }
      });
    }
  }

  checkout() {
    if (this.cart && this.cart.items.length > 0) {
      if (!this.customerAddress || !this.customerAddress.address1) {
        this.showErrorMessage('Please update your profile with a complete address before checkout.');
        this.router.navigate(['/customer/profile']);
        return;
      }
      this.isCheckingOut = true;
      const addressSnapshot = JSON.stringify(this.customerAddress || {});
      this.cartService.checkout(addressSnapshot).subscribe({
        next: (order: any) => {
          this.isCheckingOut = false;
          this.showSuccessMessage('Order created successfully! Redirecting to payment...');
          setTimeout(() => {
            this.router.navigate(['/customer/payment'], { 
              queryParams: { orderId: order.orderId } 
            });
          }, 1500);
        },
        error: (err) => {
          this.isCheckingOut = false;
          this.showErrorMessage(err.error?.message || 'Error during checkout. Please try again.');
        }
      });
    } else {
      this.showErrorMessage('Cart is empty, please add products to check out');
    }
  }

  showSuccessMessage(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast-success';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
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
    }, 3000);
  }

  showErrorMessage(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast-error';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
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
    }, 4000);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
