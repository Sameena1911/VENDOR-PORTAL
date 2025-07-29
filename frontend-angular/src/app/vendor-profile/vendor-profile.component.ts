import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export interface VendorProfile {
  vendorId: string;
  vendorName: string;
  country: string;
  city: string;
  status?: string;
  lastUpdated: string;
}

@Component({
  selector: 'app-vendor-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-profile.component.html',
  styleUrls: ['./vendor-profile.component.css']
})
export class VendorProfileComponent implements OnInit {
  vendorProfile: VendorProfile | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadVendorProfile();
  }

  async loadVendorProfile() {
    this.loading = true;
    this.error = null;

    try {
      const response = await this.authService.getVendorProfile();
      this.vendorProfile = response.data;
    } catch (error: any) {
      console.error('Error loading vendor profile:', error);
      this.error = error.error?.message || 'Failed to load vendor profile';
      
      // If unauthorized, redirect to login
      if (error.status === 401) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    } finally {
      this.loading = false;
    }
  }

  refreshProfile() {
    this.loadVendorProfile();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getCountryName(countryCode: string): string {
    const countries: { [key: string]: string } = {
      'IN': 'India',
      'US': 'United States',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan',
      'CN': 'China',
      'AU': 'Australia',
      'CA': 'Canada',
      'BR': 'Brazil'
    };
    return countries[countryCode] || countryCode;
  }
}
