import { Component } from '@angular/core';
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
    <div class="card">
      <h2>Login to Vendor Portal</h2>
      <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
        <div class="form-group">
          <label for="email">Vendor ID:</label>
          <input
            type="text"
            id="email"
            name="email"
            [(ngModel)]="loginData.email"
            required
            #email="ngModel"
            placeholder="Enter your Vendor ID"
          />
          <div *ngIf="email.invalid && email.touched" class="error">
            Please enter your Vendor ID
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            [(ngModel)]="loginData.password"
            required
            #password="ngModel"
          />
          <div *ngIf="password.invalid && password.touched" class="error">
            Password is required
          </div>
        </div>
        
        <div *ngIf="errorMessage" class="error">
          {{ errorMessage }}
        </div>
        
        <div *ngIf="successMessage" class="success">
          {{ successMessage }}
        </div>
        
        <button 
          type="submit" 
          class="btn" 
          [disabled]="loginForm.invalid || isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div style="margin-top: 20px; text-align: center; font-size: 14px; color: #666;">
        <p>SAP Vendor Portal Login</p>
        <p>Enter your Vendor ID and Password</p>
        <p>(from ZVP_LOGIN_TABLE)</p>
      </div>
    </div>
  `,
  styles: [`
    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
      font-weight: 300;
    }
  `]
})
export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

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
