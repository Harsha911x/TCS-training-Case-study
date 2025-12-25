import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="payment-container">
      <div class="payment-header">
        <div class="header-content">
          <a routerLink="/customer/home" class="logo">E-Cart</a>
          <div class="header-nav">
            <a routerLink="/customer/home">Home</a>
            <a routerLink="/customer/cart">Cart</a>
            <a routerLink="/customer/orders">Orders</a>
            <button (click)="logout()" class="logout-btn">Sign Out</button>
          </div>
        </div>
      </div>

      <div class="payment-content">
        <div class="container">
          <div class="payment-layout">
            <div class="payment-form-section address-box">
              <h1>Address Details</h1>
              <fieldset [disabled]="!editingAddress">
              <form class="form-group" [formGroup]="addressForm">
                <div class="form-group">
                  <label>Name</label>
                  <input type="text" formControlName="name" placeholder="Name"
                        [class.error]="addressForm.get('name')?.invalid && addressForm.get('name')?.touched">
                  <div *ngIf="addressForm.get('name')?.hasError('required') && addressForm.get('name')?.touched" 
                      class="error-text">Name is required</div>
                  <div *ngIf="addressForm.get('name')?.hasError('pattern') && addressForm.get('name')?.touched && !addressForm.get('name')?.hasError('required')" 
                      class="error-text">Name cannot contain numbers</div>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" formControlName="address" placeholder="Address 1"
                        [class.error]="addressForm.get('address')?.invalid && addressForm.get('address')?.touched">
                  <div *ngIf="addressForm.get('address')?.hasError('required') && addressForm.get('address')?.touched" 
                      class="error-text">Address is required</div>
                  <div *ngIf="addressForm.get('address')?.hasError('pattern') && addressForm.get('address')?.touched && !addressForm.get('address')?.hasError('required')" 
                      class="error-text">Invalid Address</div>
                </div>
                <div class="form-group">
                  <label>Address 2</label>
                  <input type="text" formControlName="address2" placeholder="Address 2"
                        [class.error]="addressForm.get('address2')?.invalid && addressForm.get('address2')?.touched">
                  <div *ngIf="addressForm.get('address2')?.hasError('pattern') && addressForm.get('address2')?.touched && !addressForm.get('address2')?.hasError('required')" 
                      class="error-text">Invalid Address 2</div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label>City</label>
                    <input type="text" formControlName="city" placeholder="City"
                          [class.error]="addressForm.get('city')?.invalid && addressForm.get('city')?.touched">
                    <div *ngIf="addressForm.get('city')?.hasError('required') && addressForm.get('city')?.touched" 
                        class="error-text">City is required</div>
                    <div *ngIf="addressForm.get('city')?.hasError('pattern') && addressForm.get('city')?.touched && !addressForm.get('city')?.hasError('required')" 
                      class="error-text">Invalid City</div>
                  </div>
                  <div class="form-group">
                    <label>Zipcode</label>
                    <input type="text" formControlName="zipcode" placeholder="Zipcode"
                          [class.error]="addressForm.get('zipcode')?.invalid && addressForm.get('zipcode')?.touched">
                    <div *ngIf="addressForm.get('zipcode')?.hasError('required') && addressForm.get('zipcode')?.touched" 
                        class="error-text">Zipcode is required</div>
                    <div *ngIf="addressForm.get('zipcode')?.hasError('pattern') && addressForm.get('zipcode')?.touched && !addressForm.get('zipcode')?.hasError('required')" 
                      class="error-text">Invalid Zipcode</div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>State</label>
                    <input type="text" formControlName="state" placeholder="State"
                          [class.error]="addressForm.get('state')?.invalid && addressForm.get('state')?.touched">
                    <div *ngIf="addressForm.get('state')?.hasError('required') && addressForm.get('state')?.touched" 
                        class="error-text">State is required</div>
                    <div *ngIf="addressForm.get('state')?.hasError('pattern') && addressForm.get('state')?.touched && !addressForm.get('state')?.hasError('required')" 
                      class="error-text">Invalid State</div>
                  </div>
                  <div class="form-group">
                    <label>Country</label>
                    <input type="text" formControlName="country" placeholder="Country"
                          [class.error]="addressForm.get('country')?.invalid && addressForm.get('country')?.touched">
                    <div *ngIf="addressForm.get('country')?.hasError('required') && addressForm.get('country')?.touched" 
                        class="error-text">Country is required</div>
                    <div *ngIf="addressForm.get('country')?.hasError('pattern') && addressForm.get('country')?.touched && !addressForm.get('country')?.hasError('required')" 
                      class="error-text">Invalid Country</div>
                  </div>
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="text" formControlName="phoneNumber" placeholder="Phone Number"
                        [class.error]="addressForm.get('phoneNumber')?.invalid && addressForm.get('phoneNumber')?.touched">
                  <div *ngIf="addressForm.get('phoneNumber')?.hasError('required') && addressForm.get('phoneNumber')?.touched" 
                      class="error-text">Phone Number is required</div>
                  <div *ngIf="addressForm.get('phoneNumber')?.hasError('pattern') && addressForm.get('phoneNumber')?.touched && !addressForm.get('phoneNumber')?.hasError('required')" 
                      class="error-text">Invalid Phone Number</div>
                </div>
              </form>
              </fieldset>
              <button *ngIf="!editingAddress" class="form-group btn-primary" (click)="editAddress()">Edit</button>
              <button *ngIf="editingAddress" class="form-group btn-primary" (click)="saveNewAddress()">Save</button>
            </div>

            <div class="payment-form-section payment-box">
              <h1>Select a payment method</h1>
              <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
                <div class="payment-mode-selection">
                  <label class="payment-option">
                    <input type="radio" formControlName="paymentMode" value="CREDIT_CARD" 
                           (change)="onPaymentModeChange()">
                    <span>Credit Card</span>
                  </label>
                  <label class="payment-option">
                    <input type="radio" formControlName="paymentMode" value="UPI" 
                           (change)="onPaymentModeChange()">
                    <span>UPI</span>
                  </label>
                </div>

                <div *ngIf="paymentForm.get('paymentMode')?.value === 'CREDIT_CARD'" class="payment-details">
                  <div class="form-group">
                    <label>Card Number *</label>
                    <input type="text" formControlName="cardNumber" maxlength="16" 
                           placeholder="1234 5678 9012 3456"
                           [class.error]="paymentForm.get('cardNumber')?.invalid && paymentForm.get('cardNumber')?.touched">
                    <div *ngIf="paymentForm.get('cardNumber')?.hasError('required') && paymentForm.get('cardNumber')?.touched" 
                         class="error-text">Card number is required</div>
                    <div *ngIf="paymentForm.get('cardNumber')?.hasError('minlength') && paymentForm.get('cardNumber')?.touched" 
                         class="error-text">Card number must be at least 16 digits</div>
                  </div>

                  <div class="form-group">
                    <label>Card Holder Name *</label>
                    <input type="text" formControlName="cardHolderName" 
                           placeholder="John Doe"
                           [class.error]="paymentForm.get('cardHolderName')?.invalid && paymentForm.get('cardHolderName')?.touched">
                    <div *ngIf="paymentForm.get('cardHolderName')?.hasError('required') && paymentForm.get('cardHolderName')?.touched" 
                         class="error-text">Card holder name is required</div>
                    <div *ngIf="paymentForm.get('cardHolderName')?.hasError('minlength') && paymentForm.get('cardHolderName')?.touched" 
                         class="error-text">Card holder name must be at least 10 characters</div>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Expiry Date (MM/YY) *</label>
                      <input type="text" formControlName="expiryDate" placeholder="12/25"
                             [class.error]="paymentForm.get('expiryDate')?.invalid && paymentForm.get('expiryDate')?.touched">
                      <div *ngIf="paymentForm.get('expiryDate')?.hasError('required') && paymentForm.get('expiryDate')?.touched" 
                           class="error-text">Expiry date is required</div>
                      <div *ngIf="paymentForm.get('expiryDate')?.hasError('pattern') && paymentForm.get('expiryDate')?.touched" 
                           class="error-text">Expiry date must be in MM/YY format</div>
                      <div *ngIf="paymentForm.get('expiryDate')?.hasError('invalidDate') && paymentForm.get('expiryDate')?.touched" 
                           class="error-text">Enter a valid date</div>
                      <div *ngIf="paymentForm.get('expiryDate')?.hasError('cardExpired') && paymentForm.get('expiryDate')?.touched" 
                           class="error-text">Expiry date cannot be in the past</div>
                    </div>

                    <div class="form-group">
                      <label>CVV *</label>
                      <input type="text" formControlName="cvv" maxlength="4" placeholder="1234"
                             [class.error]="paymentForm.get('cvv')?.invalid && paymentForm.get('cvv')?.touched">
                      <div *ngIf="paymentForm.get('cvv')?.hasError('required') && paymentForm.get('cvv')?.touched" 
                           class="error-text">CVV is required</div>
                      <div *ngIf="paymentForm.get('cvv')?.hasError('pattern') && paymentForm.get('cvv')?.touched" 
                           class="error-text">CVV must be 3 or 4 digits</div>
                    </div>
                  </div>
                </div>

                <div *ngIf="paymentForm.get('paymentMode')?.value === 'UPI'" class="payment-details">
                  <div class="form-group">
                    <label>UPI ID *</label>
                    <input type="text" formControlName="upiId" placeholder="yourname@paytm"
                           [class.error]="paymentForm.get('upiId')?.invalid && paymentForm.get('upiId')?.touched">
                    <div *ngIf="paymentForm.get('upiId')?.hasError('required') && paymentForm.get('upiId')?.touched" 
                         class="error-text">UPI ID is required</div>
                    <div *ngIf="paymentForm.get('upiId')?.hasError('upiCheck') && paymentForm.get('upiId')?.touched" 
                         class="error-text">Invalid UPI ID</div>
                  </div>
                </div>

                <div *ngIf="errorMessage" class="error-box">{{errorMessage}}</div>

                <div *ngIf="showSuccess" class="modal-overlay">
                  <div class="modal-content" (click)="$event.stopPropagation()">
                    <div class="success-icon">✅</div>
                    <h2>Payment Successful!</h2>
                    <div class="success-details">
                      <p><strong>Transaction ID:</strong> {{transactionId}}</p>
                      <p><strong>Order ID:</strong> {{orderId}}</p>
                      <p class="success-message">Your order has been confirmed and will be processed soon. You can track your order in the Orders section.</p>
                    </div>
                    <div class="success-actions">
                      <button (click)="downloadInvoice()" class="btn-secondary">
                        <span>📄</span>
                        <span>Download Invoice</span>
                      </button>
                      <button (click)="goToOrders()" class="btn-primary">
                        <span>📦</span>
                        <span>View My Orders</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button *ngIf="!showSuccess" type="submit" [disabled]="paymentForm.invalid || isSubmitting" 
                        class="submit-btn" [class.loading]="isSubmitting">
                  <span *ngIf="!isSubmitting">Make Payment</span>
                  <span *ngIf="isSubmitting">Processing Payment...</span>
                </button>
              </form>
            </div>

            <div class="order-summary-section order-box" *ngIf="orderDetails">
              <div class="summary-card">
                <h2>Order Summary</h2>
                <div class="summary-item">
                  <span>Order ID:</span>
                  <span>{{orderId}}</span>
                </div>
                <div class="summary-item">
                  <span>Order Date:</span>
                  <span>{{orderDetails.createdAt | date}}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-item" *ngFor="let item of orderDetails.items">
                  <div class="item-summary">
                    <span>{{item.productName}} x{{item.quantity}}</span>
                    <span>{{ '₹' + (item.unitPrice * item.quantity).toFixed(2) }}</span>
                  </div>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-item total">
                  <span><strong>Order Total:</strong></span>
                  <span class="total-amount">{{ '₹' + orderDetails.totalAmount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      min-height: 100vh;
      background: #EAEDED;
    }

    .payment-header {
      background: #131921;
      color: white;
      padding: 10px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #FF9900;
      text-decoration: none;
    }

    .header-nav {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .header-nav a {
      color: white;
      text-decoration: none;
      font-size: 14px;
      padding: 5px 10px;
      border-radius: 3px;
      transition: background 0.2s;
    }

    .logout-btn {
      background: #f0c14b;
      border: 1px solid #a88734;
      color: #111;
      padding: 6px 15px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 14px;
    }

    .payment-content {
      padding: 30px 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .payment-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 30px;
    }

    .address-box {
      grid-column: 1;
      grid-row: 1;
    }

    .payment-box {
      grid-column: 1;
      grid-row: 2;
    }

    .order-box {
      grid-column: 2;
      grid-row: 1 / span 2;
    }

    .payment-form-section {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .payment-form-section h1 {
      font-size: 24px;
      font-weight: 400;
      margin-bottom: 20px;
      color: #111;
    }

    .payment-mode-selection {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e7e7e7;
    }

    .payment-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 16px;
    }

    .payment-option input[type="radio"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .payment-details {
      margin-bottom: 20px;
    }

    .form-row {
      display: flex;
      gap: 15px;
    }

    .form-group {
      margin-bottom: 20px;
      flex: 1;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #111;
      margin-bottom: 5px;
    }

    .form-group input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid #a6a6a6;
      border-radius: 4px;
      font-size: 13px;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: #e77600;
      box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
    }

    .form-group input.error {
      border-color: #c40000;
    }

    .error-text {
      color: #c40000;
      font-size: 12px;
      margin-top: 4px;
    }

    .error-box {
      background: #fff4f4;
      border: 1px solid #c40000;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 15px;
      color: #c40000;
      font-size: 13px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border: 2px solid #28a745;
      border-radius: 12px;
      padding: 40px;
      color: #155724;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.4s ease-out;
    }

    .success-icon {
      font-size: 64px;
      margin-bottom: 15px;
      animation: bounceIn 0.6s ease-out;
    }

    .modal-content strong {
      display: block;
      font-size: 24px;
      margin-bottom: 15px;
      color: #0f5132;
      font-weight: 600;
    }

    .modal-content p {
      margin: 20px 0;
      font-size: 16px;
      color: #155724;
      font-weight: 500;
      line-height: 1.5;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes bounceIn {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .success-details {
      margin-bottom: 20px;
      text-align: left;
      background: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #c3e6cb;
    }

    .success-details p {
      margin: 10px 0;
      font-size: 14px;
      color: #155724;
    }

    .success-message {
      color: #0f5132 !important;
      font-weight: 500;
      margin-top: 15px !important;
      padding-top: 15px;
      border-top: 1px solid #c3e6cb;
    }

    .success-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }

    .btn-primary,
    .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      justify-content: center;
    }

    .btn-primary {
      background: #FF9900;
      color: white;
      box-shadow: 0 2px 4px rgba(255, 153, 0, 0.3);
    }

    .btn-primary:hover {
      background: #FFB84D;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 153, 0, 0.4);
    }

    .btn-secondary {
      background: white;
      border: 2px solid #28a745;
      color: #155724;
    }

    .btn-secondary:hover {
      background: #f8f9fa;
      border-color: #1e7e34;
      transform: translateY(-2px);
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      background: #FFD814;
      border: none;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      color: #111;
      transition: background 0.2s;
    }

    .submit-btn:hover:not(:disabled) {
      background: #FCD200;
    }

    .submit-btn:disabled {
      background: #e7e9ec;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .order-summary-section {
      position: sticky;
      top: 80px;
      height: fit-content;
    }

    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .summary-card h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #111;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }

    .summary-item.total {
      border-top: 1px solid #e7e7e7;
      padding-top: 10px;
      margin-top: 10px;
    }

    .total-amount {
      font-size: 18px;
      font-weight: 700;
      color: #B12704;
    }

    .summary-divider {
      height: 1px;
      background: #e7e7e7;
      margin: 10px 0;
    }

    .item-summary {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }

    @media (max-width: 968px) {
      .payment-layout {
        grid-template-columns: 1fr;
      }

      .order-summary-section {
        position: relative;
        top: 0;
      }
      
      .order-box {
        grid-column: 1;
        grid-row: 3;
      }
    }
  `]
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  addressForm: FormGroup;
  orderId = '';
  errorMessage = '';
  showSuccess = false;
  transactionId = '';
  isSubmitting = false;
  orderDetails: any = null;
  editingAddress: boolean = false;
  customerAddress: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private orderService: OrderService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      paymentMode: ['', Validators.required],
      cardNumber: [''],
      cardHolderName: [''],
      expiryDate: [''],
      cvv: [''],
      upiId: ['']
    });

    this.addressForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s'-]+$/)]],
      address: ['',[Validators.required, Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9 #/]{3,}$/)]],
      address2: ['', Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9 #/]{3,}$/)],
      city: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s'-]+$/)]],
      zipcode: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\s'-]+$/)]],
      state: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s'-]+$/)]],
      country: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s'-]+$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[1-9]\d{9,14}$/)]]
    });
  }

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParams['orderId'] || '';
    if (this.orderId) {
      this.loadOrderDetails();
    }
    this.loadCustomerAddress();
  }

  loadOrderDetails() {
    this.orderService.getOrder(this.orderId).subscribe({
      next: (order) => {
        this.orderDetails = order;
      },
      error: (err) => {
        console.error('Error loading order details:', err);
      }
    });
  }

  onPaymentModeChange() {
    const mode = this.paymentForm.get('paymentMode')?.value;
    if (mode === 'CREDIT_CARD') {
      this.paymentForm.get('cardNumber')?.setValidators([Validators.required, Validators.minLength(16)]);
      this.paymentForm.get('cardHolderName')?.setValidators([Validators.required, Validators.minLength(10)]);
      this.paymentForm.get('expiryDate')?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/), this.expiryDateValidator]);
      this.paymentForm.get('cvv')?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
      this.paymentForm.get('upiId')?.clearValidators();
      this.paymentForm.get('upiId')?.setValue('');
    } else if (mode === 'UPI') {
      this.paymentForm.get('upiId')?.setValidators([Validators.required, this.upiValidator]);
      this.paymentForm.get('cardNumber')?.clearValidators();
      this.paymentForm.get('cardHolderName')?.clearValidators();
      this.paymentForm.get('expiryDate')?.clearValidators();
      this.paymentForm.get('cvv')?.clearValidators();
      this.paymentForm.get('cardNumber')?.setValue('');
      this.paymentForm.get('cardHolderName')?.setValue('');
      this.paymentForm.get('expiryDate')?.setValue('');
      this.paymentForm.get('cvv')?.setValue('');
    }
    this.paymentForm.updateValueAndValidity();
  }

  expiryDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const inputDateParts = control.value.split('/');
    const inputMonth = parseInt(inputDateParts[0], 10);
    const inputYear = parseInt(inputDateParts[1], 10);

    if (isNaN(inputMonth) || isNaN(inputYear) || inputMonth < 1 || inputMonth > 12) {
      return { invalidDate: true };
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (inputYear > currentYear) {
      return null;
    }

    if (inputYear === currentYear && inputMonth >= currentMonth) {
      return null;
    }

    return { cardExpired: true };
  };

  upiValidator(control: AbstractControl): ValidationErrors | null {
    let upiHandles: string[] = ['apl', 'yapl', 'upi', 'boi', 'pnb', 'sbi', 'okhdfcbank', 'okaxis', 'okicici', 'icici', 'ikwik', 'jio', 'paytm', 'ybl', 'ibl', 'axl', 'tapicici'];
    if (!control.value) {
      return null;
    }

    const pattern = new RegExp(`^[a-zA-Z0-9]+@(${upiHandles.join('|')})$`);

    const isValid = pattern.test(control.value);

    return isValid ? null : { upiCheck: true };
  }

  onSubmit() {
    if (this.paymentForm.valid && this.orderId) {
      if (this.editingAddress) {
        this.showErrorNotification("Save address before continuing");
        return;
      }
      this.isSubmitting = true;
      this.errorMessage = '';

      const addressSnapshot = JSON.stringify(this.customerAddress || {});

      const paymentData = {
        orderId: this.orderId,
        ...this.paymentForm.value,
        addressSnapshot: addressSnapshot,
      };

      this.http.post('http://localhost:8080/api/customers/me/payments', paymentData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          this.transactionId = response.transactionId;
          this.showSuccess = true;
          // Reload order details to get updated information
          this.loadOrderDetails();
          // Show success notification
          this.showSuccessNotification('Payment successful! Your order has been confirmed.');
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Payment failed. Please try again.';
          this.showErrorNotification(this.errorMessage);
        }
      });
    } else {
      this.paymentForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required payment details.';
    }
  }

  editAddress() {
    this.editingAddress = true;
  }

  saveNewAddress() {
    this.customerAddress = {
      name: this.addressForm.controls['name'].value,
      address1: this.addressForm.controls['address'].value,
      address2: this.addressForm.controls['address2'].value,
      city: this.addressForm.controls['city'].value,
      state: this.addressForm.controls['state'].value,
      zipCode: this.addressForm.controls['zipcode'].value,
      country: this.addressForm.controls['country'].value,
      phoneNumber: this.addressForm.controls['phoneNumber'].value
    }

    this.showSuccessNotification("Address saved successfully.");
    this.editingAddress = false;
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
        this.addressForm.setValue({
          name: this.customerAddress.name,
          address: this.customerAddress.address1,
          address2: this.customerAddress.address2,
          city: this.customerAddress.city,
          zipcode: this.customerAddress.zipCode,
          state: this.customerAddress.state,
          country: this.customerAddress.country,
          phoneNumber: this.customerAddress.phoneNumber
        });
      },
      error: (err) => {
        console.error('Error loading customer address:', err);
      }
    });
  }

  showSuccessNotification(message: string) {
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

  showErrorNotification(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast-error';
    toast.innerHTML = `<strong>✗ ${message}</strong>`;
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #dc3545;
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

  downloadInvoice() {
    this.orderService.downloadInvoice(this.orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${this.orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Error downloading invoice');
      }
    });
  }

  goToOrders() {
    this.router.navigate(['/customer/orders'], { queryParams: { paymentSuccess: 'true' } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
