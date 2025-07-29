import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { VendorProfileComponent } from '../vendor-profile/vendor-profile.component';
import { AuthService } from '../services';

@Component({
  selector: 'app-simple-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, VendorProfileComponent],
  templateUrl: './simple-dashboard.component.html',
  styleUrls: ['./simple-dashboard.component.css']
})
export class SimpleDashboardComponent implements OnInit {
  selectedMenu = 'dashboard';
  username: string = '';
  vendorInfo = {
    companyName: 'ABC Technologies Pvt Ltd',
    email: 'vendor@abctech.com',
    phone: '+91 9876543210',
    address: 'Plot No. 123, Industrial Area, Bangalore - 560001'
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const userInfo = this.authService.getUserInfo();
    this.username = userInfo?.vendorId || 'VENDOR001';
  }

  onMenuSelect(action: string) {
    this.selectedMenu = action;
  }

  getPageSubtitle(): string {
    switch (this.selectedMenu) {
      case 'dashboard': return 'Overview and Summary';
      case 'vendor-profile': return 'SAP Vendor Information from LFA1 Table';
      case 'rfqs': return 'Request for Quotation Management';
      case 'pos': return 'Purchase Order Tracking';
      case 'grs': return 'Goods Receipt Processing';
      case 'financials': return 'Financial Reports and Analysis';
      default: return 'Vendor Portal Services';
    }
  }

  logout() {
    this.authService.logout();
    // Navigation is handled in AuthService
  }
}
