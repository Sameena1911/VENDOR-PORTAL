import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-icon">🏢</div>
            <h1 class="portal-title">Vendor Portal</h1>
            <p class="portal-subtitle">SAP Integrated Business Platform</p>
          </div>
        </div>
        
        <div class="login-body">
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-description">Sign in to access your vendor dashboard</p>
          
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">
                <span class="label-icon">👤</span>
                Vendor ID
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="email"
                  name="email"
                  [(ngModel)]="loginData.email"
                  required
                  #email="ngModel"
                  placeholder="Enter your Vendor ID"
                  class="form-input"
                  [class.error]="email.invalid && email.touched"
                />
              </div>
              <div *ngIf="email.invalid && email.touched" class="error-message">
                <span class="error-icon">⚠️</span>
                Please enter your Vendor ID
              </div>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">
                <span class="label-icon">🔒</span>
                Password
              </label>
              <div class="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  [(ngModel)]="loginData.password"
                  required
                  placeholder="Enter your password"
                  #password="ngModel"
                  class="form-input"
                  [class.error]="password.invalid && password.touched"
                />
              </div>
              <div *ngIf="password.invalid && password.touched" class="error-message">
                <span class="error-icon">⚠️</span>
                Password is required
              </div>
            </div>
            
            <div *ngIf="errorMessage" class="alert error-alert">
              <span class="alert-icon">❌</span>
              <span class="alert-text">{{ errorMessage }}</span>
            </div>
            
            <div *ngIf="successMessage" class="alert success-alert">
              <span class="alert-icon">✅</span>
              <span class="alert-text">{{ successMessage }}</span>
            </div>
            
            <button 
              type="submit" 
              class="login-btn"
              [disabled]="loginForm.invalid || isLoading"
              [class.loading]="isLoading"
            >
              <span *ngIf="!isLoading" class="btn-content">
                <span class="btn-icon">🚀</span>
                Sign In
              </span>
              <span *ngIf="isLoading" class="btn-content">
                <span class="loading-spinner"></span>
                Signing In...
              </span>
            </button>
          </form>
        </div>
        
        <div class="login-footer">
          <div class="footer-info">
            <p class="info-text">
              <span class="info-icon">🔐</span>
              Secure SAP Authentication
            </p>
            <p class="help-text">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      
      width: 100%;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 440px;
      overflow: hidden;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .logo-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .portal-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .portal-subtitle {
      font-size: 14px;
      margin: 0;
      opacity: 0.9;
      font-weight: 300;
    }

    .login-body {
      padding: 40px 30px;
    }

    .login-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      text-align: center;
      margin: 0 0 8px 0;
    }

    .login-description {
      font-size: 14px;
      color: #666;
      text-align: center;
      margin: 0 0 32px 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    .label-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #fafafa;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #2196F3;
      background: white;
      box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
    }

    .form-input.error {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    .error-message {
      display: flex;
      align-items: center;
      margin-top: 8px;
      font-size: 13px;
      color: #ef4444;
    }

    .error-icon {
      margin-right: 6px;
      font-size: 14px;
    }

    .alert {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .error-alert {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }

    .success-alert {
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    }

    .login-btn {
      width: 100%;
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 8px;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(33, 150, 243, 0.3);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .login-btn.loading {
      background: #90caf9;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
    }

    .footer-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .info-text {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #6b7280;
      margin: 0;
      font-weight: 500;
    }

    .info-icon {
      margin-right: 6px;
      font-size: 14px;
    }

    .help-text {
      font-size: 12px;
      color: #9ca3af;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
      
      .login-body {
        padding: 30px 24px;
      }
      
      .login-header {
        padding: 24px;
      }
      
      .portal-title {
        font-size: 24px;
      }
      
      .login-title {
        font-size: 20px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginData = {
    email: '',
    password: ''
  };
  
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    // Clear any existing authentication data when login component loads
    this.authService.clearAuthData();
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Call backend API
    this.http.post('http://localhost:3001/api/auth/login', this.loginData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Login successful!';
          
          // Store token using auth service
          if (response.token) {
            this.authService.login(response.token);
          }
          
          // Redirect to dashboard
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
  }
}
