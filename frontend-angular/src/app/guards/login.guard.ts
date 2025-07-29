import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // User is already authenticated, redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }
    
    // User is not authenticated, allow access to login
    return true;
  }
}
