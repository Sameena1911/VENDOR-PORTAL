import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { VendorProfileComponent } from '../vendor-profile/vendor-profile.component';
import { PaymentAgingReportsComponent } from '../payment-aging-reports/payment-aging-reports.component';
import { CreditDebitMemoComponent } from '../credit-debit-memo/credit-debit-memo.component';
import { InvoiceComponent } from '../invoice/invoice.component';
import { PurchaseOrderComponent } from '../purchase-order/purchase-order.component';
import { GoodsReceiptComponent } from '../goods-receipt/goods-receipt.component';
import { RFQComponent } from '../rfq/rfq.component';
import { AuthService } from '../services';

@Component({
  selector: 'app-simple-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, VendorProfileComponent, PaymentAgingReportsComponent, CreditDebitMemoComponent, InvoiceComponent, PurchaseOrderComponent, GoodsReceiptComponent, RFQComponent],
  templateUrl: './simple-dashboard.component.html',
  styleUrls: ['./simple-dashboard.component.css']
})
export class SimpleDashboardComponent implements OnInit {
  selectedMenu = 'dashboard';
  username: string = '';
  vendorName: string = '';
  vendorInfo = {
    companyName: 'ABC Technologies Pvt Ltd',
    email: 'vendor@abctech.com',
    phone: '+91 9876543210',
    address: 'Plot No. 123, Industrial Area, Bangalore - 560001'
  };

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const userInfo = this.authService.getUserInfo();
    this.username = userInfo?.vendorId || '0000100000';
    this.loadVendorProfile();
  }

  async loadVendorProfile() {
    try {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      const response = await this.http.get<any>('http://localhost:3001/api/vendor/profile', { headers }).toPromise();
      
      if (response && response.data && response.data.vendorName) {
        this.vendorName = response.data.vendorName;
        this.username = this.vendorName; // Use vendor name instead of ID
      }
    } catch (error) {
      console.error('Error loading vendor profile:', error);
      // Keep using vendor ID if profile fetch fails
    }
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
      case 'invoice': return 'Invoice Management';
      case 'payment-aging': return 'Payment and Aging Reports';
      case 'credit-debit-memo': return 'Credit and Debit Memo Management';
      default: return 'Vendor Portal Services';
    }
  }

  logout() {
    this.authService.logout();
    // Navigation is handled in AuthService
  }
}
