import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { COUNTRIES, ZIP_CODES, Country } from '../../../core/data/countries-states';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="profile-container">
      <app-navbar [role]="'customer'" [userName]="customerName" [cartCount]="cartItemCount" (signOut)="logout()"></app-navbar>

      <div class="profile-content">
        <div class="profile-card">
          <h1>Your Account</h1>
          <div class="profile-section">
            <h2>Profile Information</h2>
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
              <div class="form-row">
                <div class="form-group full-width">
                  <label>Your Name</label>
                  <input type="text" formControlName="name" maxlength="50"
                         [class.error]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched">
                  <div *ngIf="profileForm.get('name')?.hasError('required') && profileForm.get('name')?.touched" 
                       class="error-text">Name is required</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Country</label>
                  <select formControlName="country" (change)="onCountryChange()"
                          [class.error]="profileForm.get('country')?.invalid && profileForm.get('country')?.touched">
                    <option value="">Select a country</option>
                    <option *ngFor="let country of countries" [value]="country.name">{{country.name}}</option>
                  </select>
                  <div *ngIf="profileForm.get('country')?.hasError('required') && profileForm.get('country')?.touched" 
                       class="error-text">Country is required</div>
                </div>

                <div class="form-group">
                  <label>State</label>
                  <select formControlName="state" (change)="onStateChange()"
                          [class.error]="profileForm.get('state')?.invalid && profileForm.get('state')?.touched"
                          [disabled]="!selectedCountry">
                    <option value="">Select a state</option>
                    <option *ngFor="let state of availableStates" [value]="state">{{state}}</option>
                  </select>
                  <div *ngIf="profileForm.get('state')?.hasError('required') && profileForm.get('state')?.touched" 
                       class="error-text">State is required</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label>City</label>
                  <input type="text" formControlName="city"
                         [class.error]="profileForm.get('city')?.invalid && profileForm.get('city')?.touched">
                  <div *ngIf="profileForm.get('city')?.hasError('required') && profileForm.get('city')?.touched" 
                       class="error-text">City is required</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label>Address Line 1</label>
                  <textarea formControlName="address1" rows="3"
                            [class.error]="profileForm.get('address1')?.invalid && profileForm.get('address1')?.touched"></textarea>
                  <div *ngIf="profileForm.get('address1')?.hasError('required') && profileForm.get('address1')?.touched" 
                       class="error-text">Address is required</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label>Address Line 2 (Optional)</label>
                  <textarea formControlName="address2" rows="3"></textarea>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Zip Code</label>
                  <input type="text" formControlName="zipCode"
                         [class.error]="profileForm.get('zipCode')?.invalid && profileForm.get('zipCode')?.touched">
                  <div *ngIf="profileForm.get('zipCode')?.hasError('required') && profileForm.get('zipCode')?.touched" 
                       class="error-text">Zip code is required</div>
                </div>

                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="text" formControlName="phoneNumber"
                         [class.error]="profileForm.get('phoneNumber')?.invalid && profileForm.get('phoneNumber')?.touched">
                  <div *ngIf="profileForm.get('phoneNumber')?.hasError('required') && profileForm.get('phoneNumber')?.touched" 
                       class="error-text">Phone number is required</div>
                  <div *ngIf="profileForm.get('phoneNumber')?.hasError('pattern') && profileForm.get('phoneNumber')?.touched" 
                       class="error-text">Phone Number should not start with 0</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label>Email</label>
                  <input type="email" formControlName="email"
                         [class.error]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                  <div *ngIf="profileForm.get('email')?.hasError('required') && profileForm.get('email')?.touched" 
                       class="error-text">Email is required</div>
                  <div *ngIf="profileForm.get('email')?.hasError('email') && profileForm.get('email')?.touched" 
                       class="error-text">Enter a valid email address</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Password (leave blank to keep current)</label>
                  <input type="password" formControlName="password" (input)="onPasswordChange()">
                </div>

                <div class="form-group" *ngIf="showConfirmPassword">
                  <label>Confirm Password</label>
                  <input type="password" formControlName="confirmPassword"
                         [class.error]="profileForm.hasError('passwordMismatch') && profileForm.get('confirmPassword')?.touched">
                  <div *ngIf="profileForm.hasError('passwordMismatch') && profileForm.get('confirmPassword')?.touched" 
                       class="error-text">Passwords do not match</div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="error-box">{{errorMessage}}</div>

              <button type="submit" [disabled]="profileForm.invalid || isSubmitting" 
                      class="submit-btn" [class.loading]="isSubmitting">
                <span *ngIf="!isSubmitting">Save Changes</span>
                <span *ngIf="isSubmitting">Saving...</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal Overlay -->
    <div *ngIf="successMessage" class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="success-icon">✅</div>
        <strong>Details Updated Successfully!</strong>
        <p>Your profile information has been saved.</p>
        <button type="button" (click)="closeModal()" class="success-btn">
          OK
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background: #EAEDED;
    }

    .profile-content {
      padding: 30px 20px;
    }

    .profile-card {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .profile-card h1 {
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 20px;
      color: #111;
    }

    .profile-section h2 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #111;
      padding-bottom: 10px;
      border-bottom: 1px solid #e7e7e7;
    }

    .form-row {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      width: 100%;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: #111;
      margin-bottom: 5px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 8px 10px;
      border: 1px solid #a6a6a6;
      border-radius: 4px;
      font-size: 13px;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #e77600;
      box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
    }

    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
      border-color: #c40000;
    }

    .form-group textarea {
      resize: vertical;
      font-family: inherit;
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

    .success-btn {
      margin-top: 20px;
      padding: 14px 40px;
      background: #FF9900;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(255, 153, 0, 0.3);
    }

    .success-btn:hover {
      background: #FFB84D;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 153, 0, 0.4);
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

    .submit-btn {
      width: 100%;
      padding: 10px;
      background: #f0c14b;
      border: 1px solid #a88734;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      margin-top: 10px;
      transition: background 0.2s;
      color: #111;
      font-weight: 500;
    }

    .submit-btn:hover:not(:disabled) {
      background: #f4d078;
    }

    .submit-btn:disabled {
      background: #e7e9ec;
      border-color: #adb1b8;
      cursor: not-allowed;
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;
  countries = COUNTRIES;
  availableStates: string[] = [];
  selectedCountry: Country | null = null;

  customerName = '';
  cartItemCount = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      address1: ['', Validators.required],
      address2: [''],
      zipCode: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[1-9]\d{9,14}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value && confirmPassword.value && 
        password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.customerName = user?.customerName || '';
    this.loadCartCount();
    this.loadProfile();
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

  loadProfile() {
    this.http.get('http://localhost:8080/api/customers/me').subscribe({
      next: (data: any) => {
        this.profileForm.patchValue({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          address1: data.address1 || '',
          address2: data.address2 || '',
          country: data.country || '',
          state: data.state || '',
          city: data.city || '',
          zipCode: data.zipCode || ''
        });
        this.onCountryChange();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    });
  }

  onCountryChange() {
    const countryName = this.profileForm.get('country')?.value;
    this.selectedCountry = this.countries.find(c => c.name === countryName) || null;
    this.availableStates = this.selectedCountry?.states || [];
    if (!this.selectedCountry) {
      this.profileForm.patchValue({ state: '' });
    }
  }

  onStateChange() {
    // State change handler if needed
  }

  onPasswordChange() {
    const password = this.profileForm.get('password')?.value;
    this.showConfirmPassword = !!password;
    if (this.showConfirmPassword) {
      this.profileForm.get('confirmPassword')?.setValidators([
        Validators.required,
        Validators.minLength(10),
        Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{10,}$/)
      ]);
    } else {
      this.profileForm.get('confirmPassword')?.clearValidators();
      this.profileForm.get('confirmPassword')?.setValue('');
    }
    this.profileForm.get('confirmPassword')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue: any = { ...this.profileForm.value };
      
      // Remove confirmPassword and password if password is empty
      if (!formValue.password || formValue.password.trim() === '') {
        delete formValue.password;
        delete formValue.confirmPassword;
      } else {
        // If password is provided, ensure confirmPassword matches
        if (formValue.password !== formValue.confirmPassword) {
          this.isSubmitting = false;
          this.errorMessage = 'Password and confirm password do not match';
          return;
        }
        // Validate password format
        if (formValue.password.length < 10) {
          this.isSubmitting = false;
          this.errorMessage = 'Password must be at least 10 characters long';
          return;
        }
        if (!/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{10,}$/.test(formValue.password)) {
          this.isSubmitting = false;
          this.errorMessage = 'Password must contain at least one number, one uppercase letter and one alphanumeric character';
          return;
        }
      }
      
      // Always remove confirmPassword before sending
      delete formValue.confirmPassword;

      this.http.put('http://localhost:8080/api/customers/me', formValue).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.successMessage = 'Details updated successfully';
          // Clear password fields after successful update
          this.profileForm.patchValue({ password: '', confirmPassword: '' });
          this.showConfirmPassword = false;
        },
        error: (err) => {
          this.isSubmitting = false;
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else if (err.error?.fieldErrors) {
            const fieldErrors = err.error.fieldErrors;
            this.errorMessage = Object.values(fieldErrors)[0] as string;
          } else {
            this.errorMessage = 'Error updating profile. Please try again.';
          }
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
      // Show specific validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control && control.invalid && control.touched) {
          console.log(`${key} is invalid:`, control.errors);
        }
      });
    }
  }

  closeModal() {
    this.successMessage = '';
  }

  logout() {
    this.authService.logout();
    alert('You have been signed out.');
    this.router.navigate(['/']);
  }
}
