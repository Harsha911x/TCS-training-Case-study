import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { COUNTRIES, ZIP_CODES, Country } from '../../../core/data/countries-states';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-header">
        <a routerLink="/" class="logo">E-Cart</a>
      </div>
      <div class="register-content">
        <div class="register-card">
          <h1>Create Account</h1>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <!-- NAME -->
            <div class="form-row">
              <div class="form-group full-width">
                <label>Your name</label>
                <input type="text" formControlName="name" maxlength="50" 
                       [class.error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
                <div *ngIf="registerForm.get('name')?.hasError('required') && registerForm.get('name')?.touched" 
                     class="error-text">Enter your name</div>
                <div *ngIf="registerForm.get('name')?.hasError('maxlength') && registerForm.get('name')?.touched" 
                     class="error-text">Name must not exceed 50 characters</div>
                <div *ngIf="registerForm.get('name')?.hasError('pattern') && registerForm.get('name')?.touched" 
                     class="error-text">Name should not contain numbers</div>
              </div>
            </div>

            <!-- COUNTRY & STATE -->
            <div class="form-row">
              <div class="form-group">
                <label>Country</label>
                <select formControlName="country" (change)="onCountryChange()"
                        [class.error]="registerForm.get('country')?.invalid && registerForm.get('country')?.touched">
                  <option value="">Select a country</option>
                  <option *ngFor="let country of countries" [value]="country.name">{{country.name}}</option>
                </select>
                <div *ngIf="registerForm.get('country')?.hasError('required') && registerForm.get('country')?.touched" 
                     class="error-text">Select your country</div>
              </div>

              <div class="form-group">
                <label>State</label>
                <select formControlName="state" (change)="onStateChange()"
                        [class.error]="registerForm.get('state')?.invalid && registerForm.get('state')?.touched"
                        [disabled]="!selectedCountry">
                  <option value="">Select a state</option>
                  <option *ngFor="let state of availableStates" [value]="state">{{state}}</option>
                </select>
                <div *ngIf="registerForm.get('state')?.hasError('required') && registerForm.get('state')?.touched" 
                     class="error-text">Select your state</div>
              </div>
            </div>

            <!-- CITY -->
            <div class="form-row">
              <div class="form-group full-width">
                <label>City</label>
                <input type="text" formControlName="city"
                       [class.error]="registerForm.get('city')?.invalid && registerForm.get('city')?.touched">
                <div *ngIf="registerForm.get('city')?.hasError('required') && registerForm.get('city')?.touched" 
                     class="error-text">Enter your city</div>
              </div>
            </div>

            <!-- ADDRESS 1 -->
            <div class="form-row">
              <div class="form-group full-width">
                <label>Address Line 1</label>
                <textarea formControlName="address1" rows="3"
                          [class.error]="registerForm.get('address1')?.invalid && registerForm.get('address1')?.touched"></textarea>

                <!-- REQUIRED -->
                <div *ngIf="registerForm.get('address1')?.hasError('required') && registerForm.get('address1')?.touched" 
                     class="error-text">Enter your address</div>

                <!-- PATTERN ERROR -->
                <div *ngIf="registerForm.get('address1')?.hasError('pattern') && registerForm.get('address1')?.touched && !registerForm.get('address1')?.hasError('required')" 
                     class="error-text">Address must be at least 3 characters, and should contain letters,A-Z, 0-9, space, #, is allowed /</div>
              </div>
            </div>

            <!-- ADDRESS 2 -->
            <div class="form-row">
              <div class="form-group full-width">
                <label>Address Line 2 (Optional)</label>
                <textarea formControlName="address2" rows="3"
                          [class.error]="registerForm.get('address2')?.invalid && registerForm.get('address2')?.touched"></textarea>

                <!-- PATTERN ERROR -->
                <div *ngIf="registerForm.get('address2')?.hasError('pattern') && registerForm.get('address2')?.touched" 
                     class="error-text">Address must be at least 3 characters, contain letters, and allow only A-Z, 0-9, space, #, /</div>
              </div>
            </div>

            <!-- ZIP & PHONE -->
            <div class="form-row">

              <div class="form-group">
                <label>Zip Code</label>
                <select formControlName="zipCode"
                  [class.error]="registerForm.get('zipCode')?.invalid && registerForm.get('zipCode')?.touched"
                  [disabled]="!selectedState || availableZipCodes.length === 0">
                  <option value="">Select your zip code</option>
                  <option *ngFor="let zip of availableZipCodes" [value]="zip">{{zip}}</option>
                </select>
                <div *ngIf="registerForm.get('zipCode')?.hasError('required') && registerForm.get('zipCode')?.touched" 
                     class="error-text">Select your zip code</div>
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <div class="phone-input-wrapper">
                  <select formControlName="phoneCode" class="phone-code-select"
                          [class.error]="registerForm.get('phoneCode')?.invalid && registerForm.get('phoneCode')?.touched"
                          [disabled]="!selectedCountry">
                    <option value="">Code</option>
                    <option *ngIf="selectedCountry" [value]="selectedCountry.phoneCode">{{selectedCountry.phoneCode}}</option>
                  </select>
                  <input type="text" formControlName="phoneNumber" 
                         [placeholder]="selectedCountry ? 'Enter phone number' : 'Select country first'"
                         [maxlength]="selectedCountry?.code === 'IN' ? 10 : 15"
                         class="phone-number-input"
                         [class.error]="registerForm.get('phoneNumber')?.invalid && registerForm.get('phoneNumber')?.touched"
                         [disabled]="!selectedCountry">
                </div>
                <div *ngIf="registerForm.get('phoneCode')?.hasError('required') && registerForm.get('phoneCode')?.touched" 
                     class="error-text">Country code is required</div>
                <div *ngIf="registerForm.get('phoneNumber')?.hasError('required') && registerForm.get('phoneNumber')?.touched && !registerForm.get('phoneCode')?.hasError('required')" 
                     class="error-text">Enter your phone number</div>
                <div *ngIf="registerForm.get('phoneNumber')?.hasError('pattern') && registerForm.get('phoneNumber')?.touched && !registerForm.get('phoneNumber')?.hasError('required')" 
                     class="error-text">Phone Number should not start with 0 and should be 10 numbers long</div>
              </div>

            </div>

            <!-- EMAIL -->
            <div class="form-row">
              <div class="form-group full-width">
                <label>Email</label>
                <input type="email" formControlName="email"
                       [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <div *ngIf="registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched" 
                     class="error-text">Enter your email</div>
                <div *ngIf="registerForm.get('email')?.hasError('email') && registerForm.get('email')?.touched && !registerForm.get('email')?.hasError('pattern')" 
                     class="error-text">Enter a valid email address</div>
                <div *ngIf="registerForm.get('email')?.hasError('pattern') && registerForm.get('email')?.touched" 
                     class="error-text">Email must be in format: name&#64;domain.com</div>
                <div *ngIf="registerForm.get('email')?.hasError('emailExists')" 
                     class="error-text">Email already exists. Please use a different email address.</div>
              </div>
            </div>

            <!-- PASSWORD -->
            <div class="form-row">
              <div class="form-group">
                <label>Password</label>
                <input type="password" formControlName="password"
                       [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <div *ngIf="registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched" 
                     class="error-text">Enter your password</div>
                <div *ngIf="registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched && !registerForm.get('password')?.hasError('required') && !registerForm.get('password')?.hasError('pattern')" 
                     class="error-text">Password must be at least 10 characters long</div>
                <div *ngIf="registerForm.get('password')?.hasError('pattern') && registerForm.get('password')?.touched && !registerForm.get('password')?.hasError('required')" 
                     class="error-text">Your password must be at least 10 characters long, containing at least one number, one uppercase letter and one alphanumeric character</div>
              </div>

              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" formControlName="confirmPassword"
                       [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched || registerForm.hasError('passwordMismatch')">
                <div *ngIf="registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched" 
                     class="error-text">Re-enter your password</div>
                <div *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched && !registerForm.get('confirmPassword')?.hasError('required')" 
                     class="error-text">Passwords do not match</div>
              </div>
            </div>

            <div *ngIf="errorMessage && !errorMessage.includes('Email')" class="error-box">
              {{errorMessage}}
            </div>

            <button *ngIf="!successMessage" type="submit" [disabled]="registerForm.invalid || isSubmitting" 
                    class="submit-btn" [class.loading]="isSubmitting">
              <span *ngIf="!isSubmitting">Create your E-Cart account</span>
              <span *ngIf="isSubmitting">Creating account...</span>
            </button>

            <div class="register-footer">
              <p>Already have an account? <a routerLink="/login">Sign in</a></p>
              <p><a routerLink="/">Back to Home</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success Modal Overlay -->
    <div *ngIf="successMessage" class="modal-overlay" (click)="goToLogin()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="success-icon">✅</div>
        <strong>Registration Successful!</strong>
        <p>{{successMessage}}</p>
        <button type="button" (click)="goToLogin()" class="success-btn">
          OK - Go to Login
        </button>
      </div>
    </div>
  `,
  styles: [
    `
     
    .register-container {
      min-height: 100vh;
      background: linear-gradient(to bottom, #f7f7f7 0%, #ffffff 100%);
      font-family: 'Amazon Ember', Arial, sans-serif;
    }

    .register-header {
      background: #131921;
      padding: 12px 0;
      border-bottom: 1px solid #3a4553;
    }

    .logo {
      display: block;
      text-align: center;
      color: #FF9900;
      font-size: 28px;
      font-weight: bold;
      text-decoration: none;
      margin: 0 auto;
      max-width: 1200px;
      padding: 0 20px;
    }

    .logo:hover {
      color: #FFB84D;
    }

    .register-content {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 40px 20px;
      min-height: calc(100vh - 60px);
    }

    .register-card {
      background: white;
      border-radius: 8px;
      padding: 30px;
      width: 100%;
      max-width: 700px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .register-card h1 {
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 20px;
      color: #111;
    }

    .form-row {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .form-group.full-width {
      width: 100%;
      flex: 1 1 100%;
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
      font-family: inherit;
    }

    .form-group select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 30px;
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

    .phone-input-wrapper {
      display: flex;
      gap: 8px;
      align-items: stretch;
    }

    .phone-code-select {
      width: 100px;
      min-width: 100px;
      padding: 8px 5px;
      border: 1px solid #a6a6a6;
      border-radius: 4px;
      font-size: 13px;
      background: white;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .phone-code-select:focus {
      outline: none;
      border-color: #e77600;
      box-shadow: 0 0 3px 2px rgba(228, 121, 17, 0.5);
    }

    .phone-code-select.error {
      border-color: #c40000;
    }

    .phone-code-select:disabled {
      background: #f0f0f0;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .phone-number-input {
      flex: 1;
      min-width: 200px;
    }

    .error-text {
      color: #c40000;
      font-size: 12px;
      margin-top: 4px;
      line-height: 1.4;
      min-height: 16px;
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

    .register-footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e7e7e7;
      text-align: center;
      font-size: 12px;
      color: #767676;
    }

    .register-footer a {
      color: #0066c0;
      text-decoration: none;
    }

    .register-footer a:hover {
      text-decoration: underline;
      color: #c45500;
    }

    .register-footer p {
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .form-group {
        margin-bottom: 15px;
      }

      .register-card {
        padding: 20px;
      }

      .phone-input-wrapper {
        flex-direction: column;
        gap: 10px;
      }

      .phone-code-select {
        width: 100%;
        min-width: 100%;
      }
    }
  `]
})


export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  countries = COUNTRIES;
  availableStates: string[] = [];
  availableZipCodes: string[] = [];
  selectedCountry: Country | null = null;
  selectedState = '';

  selectedPhoneCode = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z\s'-]+$/)]],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],

      
      address1: ['',[Validators.required,Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9 #/.,]{3,}$/)]],
      address2: ['',[Validators.pattern(/^(?=.*[A-Za-z])[A-Za-z0-9 #/.,]{3,}$/)]],

      zipCode: ['', Validators.required],
      phoneCode: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[1-9]\d{9,14}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      password: ['', [Validators.required, Validators.minLength(10),
                     Validators.pattern(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-zA-Z0-9]).{10,}$/)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onCountryChange() {
    const countryName = this.registerForm.get('country')?.value;
    this.selectedCountry = this.countries.find(c => c.name === countryName) || null;
    this.availableStates = this.selectedCountry?.states || [];
    this.availableZipCodes = [];
    if (this.selectedCountry) {
      this.registerForm.patchValue({
        state: '',
        zipCode: '',
        phoneCode: this.selectedCountry.phoneCode
      });
    } else {
      this.registerForm.patchValue({
        state: '',
        zipCode: '',
        phoneCode: ''
      });
    }
  }

  onStateChange() {
    const countryName = this.registerForm.get('country')?.value;
    const stateName = this.registerForm.get('state')?.value;
    this.selectedState = stateName;

    if (countryName && stateName && ZIP_CODES[countryName] && ZIP_CODES[countryName][stateName]) {
      this.availableZipCodes = ZIP_CODES[countryName][stateName];
    } else {
      this.availableZipCodes = [];
    }
    this.registerForm.patchValue({ zipCode: '' });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    this.errorMessage = '';

    if (this.registerForm.valid) {
      this.isSubmitting = true;
      this.successMessage = '';

      const formValue = { ...this.registerForm.value };

      if (formValue.phoneCode && formValue.phoneNumber) {
        const phoneCode = formValue.phoneCode.replace(/^\+/, '');
        formValue.phoneNumber = phoneCode + formValue.phoneNumber;

        if (!/^[1-9]\d{9,14}$/.test(formValue.phoneNumber)) {
          this.errorMessage = 'Phone number (with country code) must be 10-15 digits and start with 1-9';
          this.isSubmitting = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      delete formValue.confirmPassword;
      delete formValue.phoneCode;

      this.authService.register(formValue).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = `Your Customer ID is: ${response.customerId}. Please save this for future login.`;
        },
        error: (err) => {
          this.isSubmitting = false;

          let errorMsg = '';
          if (err.error?.fieldErrors) {
            const fieldErrors = err.error.fieldErrors;
            const firstError = Object.values(fieldErrors)[0] as string;
            errorMsg = firstError || 'Validation failed. Please check your inputs.';
          } else if (err.error?.message) {
            errorMsg = err.error.message;
            if (errorMsg.toLowerCase().includes('email') && errorMsg.toLowerCase().includes('already')) {
              this.registerForm.get('email')?.setErrors({ 'emailExists': true });
              this.errorMessage = 'Email already exists. Please use a different email address.';
            } else {
              this.errorMessage = errorMsg;
            }
          } else if (err.status === 400) {
            this.errorMessage = 'Invalid data. Please check all fields and try again.';
          } else if (err.status === 0 || err.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }

          if (!this.errorMessage) {
            this.errorMessage = errorMsg || 'Registration failed. Please try again.';
          }

          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
      const firstError = document.querySelector('.error-text, .form-group input.error, .form-group select.error, .form-group textarea.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}