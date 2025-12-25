import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-header">
        <a routerLink="/" class="logo">E-Cart Admin</a>
      </div>
      <div class="login-content">
        <div class="login-card">
          <h1>Admin Sign-In</h1>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Username</label>
              <input type="text" formControlName="username" 
                     [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched"
                     placeholder="Enter your username">
              <div *ngIf="loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched" 
                   class="error-text">Enter your username</div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" formControlName="password"
                     [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                     placeholder="Enter your password">
              <div *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched" 
                   class="error-text">Enter your password</div>
            </div>

            <div *ngIf="errorMessage" class="error-box">
              {{errorMessage}}
            </div>

            <div *ngIf="successMessage" class="success-box">
              {{successMessage}}
            </div>

            <button type="submit" [disabled]="loginForm.invalid || isSubmitting" 
                    class="submit-btn" [class.loading]="isSubmitting">
              <span *ngIf="!isSubmitting">Sign-In</span>
              <span *ngIf="isSubmitting">Signing in...</span>
            </button>

            <div class="login-footer">
              <p><a routerLink="/">Back to Home</a></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      background: linear-gradient(to bottom, #f7f7f7 0%, #ffffff 100%);
      font-family: 'Amazon Ember', Arial, sans-serif;
    }

    .login-header {
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

    .login-content {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      min-height: calc(100vh - 60px);
    }

    .login-card {
      background: white;
      border-radius: 8px;
      padding: 30px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .login-card h1 {
      font-size: 28px;
      font-weight: 400;
      margin-bottom: 20px;
      color: #111;
    }

    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 700;
      color: #111;
      margin-bottom: 5px;
    }

    .form-group input {
      padding: 8px 10px;
      border: 1px solid #a6a6a6;
      border-radius: 4px;
      font-size: 13px;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s;
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

    .success-box {
      background: #f0f9ff;
      border: 1px solid #28a745;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 15px;
      color: #155724;
      font-size: 14px;
      font-weight: 500;
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

    .login-footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e7e7e7;
      text-align: center;
      font-size: 12px;
      color: #767676;
    }

    .login-footer a {
      color: #0066c0;
      text-decoration: none;
    }

    .login-footer a:hover {
      text-decoration: underline;
      color: #c45500;
    }

    .login-footer p {
      margin: 8px 0;
    }
  `]
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.loginAdmin(this.loginForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = `Welcome ${response.username || 'Admin'}!`;
          setTimeout(() => {
            this.router.navigate(['/admin/home']);
          }, 1500);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Invalid username or password';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}

