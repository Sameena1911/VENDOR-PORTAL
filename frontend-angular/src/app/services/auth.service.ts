import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false); // Force false initially
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private apiUrl = 'http://localhost:3001/api';

  constructor(private router: Router, private http: HttpClient) {
    // Clear all auth data on service initialization
    this.clearAuthData();
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token || token === 'null' || token === 'undefined') {
      localStorage.removeItem('token');
      return false;
    }

    try {
      // Check if token has proper JWT format
      const parts = token.split('.');
      if (parts.length !== 3) {
        localStorage.removeItem('token');
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token has required fields
      if (!payload.vendorId || !payload.exp) {
        localStorage.removeItem('token');
        return false;
      }
      
      if (payload.exp < currentTime) {
        // Token is expired
        localStorage.removeItem('token');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token format
      console.error('Invalid token format:', error);
      localStorage.removeItem('token');
      return false;
    }
  }

  login(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo'); // Clear any additional user data
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Clear all authentication data
  clearAuthData(): void {
    localStorage.clear(); // Clear everything
    sessionStorage.clear(); // Clear session storage too
    this.isLoggedInSubject.next(false);
    console.log('All authentication data cleared');
  }

  isAuthenticated(): boolean {
    const isValid = this.hasValidToken();
    this.isLoggedInSubject.next(isValid);
    return isValid;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        vendorId: payload.vendorId,
        loginTime: payload.loginTime,
        exp: payload.exp
      };
    } catch (error) {
      return null;
    }
  }

  // Get vendor profile from SAP backend
  async getVendorProfile(): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    try {
      const response = await this.http.get(`${this.apiUrl}/vendor/profile`, { headers }).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      throw error;
    }
  }

  // Generic method for making authenticated requests
  async makeRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const url = `${this.apiUrl}${endpoint}`;

    try {
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await this.http.get(url, { headers }).toPromise();
          break;
        case 'POST':
          response = await this.http.post(url, data, { headers }).toPromise();
          break;
        case 'PUT':
          response = await this.http.put(url, data, { headers }).toPromise();
          break;
        case 'DELETE':
          response = await this.http.delete(url, { headers }).toPromise();
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      return response;
    } catch (error) {
      console.error(`Error making ${method} request to ${endpoint}:`, error);
      throw error;
    }
  }
}
