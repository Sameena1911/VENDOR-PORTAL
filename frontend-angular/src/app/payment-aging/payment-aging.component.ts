import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface PaymentAgingItem {
  vendorId: string;
  documentNumber: string;
  postingDate: string;
  documentDate: string;
  currency: string;
  taxCode: string;
  amount: number;
  baselineDate: string;
  paymentTerms: string;
  dueDate: string;
  agingDays: number;
  status: string;
}

interface PaymentSummary {
  current: { count: number; amount: number };
  days30: { count: number; amount: number };
  days60: { count: number; amount: number };
  days90: { count: number; amount: number };
  overdue: { count: number; amount: number };
  total: { count: number; amount: number };
}

@Component({
  selector: 'app-payment-aging',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-aging.component.html',
  styleUrl: './payment-aging.component.css'
})
export class PaymentAgingComponent implements OnInit {
  paymentData: PaymentAgingItem[] = [];
  summary: PaymentSummary | null = null;
  loading = false;
  error: string | null = null;
  selectedFilter = 'all';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadPaymentAgingData();
  }

  async loadPaymentAgingData() {
    this.loading = true;
    this.error = null;

    try {
      const response = await this.authService.makeRequest('/api/vendor/payment-aging', 'GET');
      this.paymentData = response.data || [];
      this.summary = response.summary || null;
      console.log('Payment Aging Data:', this.paymentData);
      console.log('Summary:', this.summary);
    } catch (error: any) {
      console.error('Error loading payment aging data:', error);
      this.error = error.message || 'Failed to load payment aging data';
    } finally {
      this.loading = false;
    }
  }

  getFilteredData(): PaymentAgingItem[] {
    if (this.selectedFilter === 'all') {
      return this.paymentData;
    }

    return this.paymentData.filter(item => {
      switch (this.selectedFilter) {
        case 'current':
          return item.agingDays <= 0;
        case '30days':
          return item.agingDays > 0 && item.agingDays <= 30;
        case '60days':
          return item.agingDays > 30 && item.agingDays <= 60;
        case '90days':
          return item.agingDays > 60 && item.agingDays <= 90;
        case 'overdue':
          return item.agingDays > 90;
        default:
          return true;
      }
    });
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Current':
        return 'status-current';
      case '1-30 Days':
        return 'status-30days';
      case '31-60 Days':
        return 'status-60days';
      case '61-90 Days':
        return 'status-90days';
      case '90+ Days Overdue':
        return 'status-overdue';
      default:
        return 'status-default';
    }
  }

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  refreshData() {
    this.loadPaymentAgingData();
  }

  trackByDocumentNumber(index: number, item: PaymentAgingItem): string {
    return item.documentNumber;
  }
}
