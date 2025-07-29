import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {}

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired
        localStorage.removeItem('token');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token
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

  isAuthenticated(): boolean {
    return this.hasValidToken();
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
}
