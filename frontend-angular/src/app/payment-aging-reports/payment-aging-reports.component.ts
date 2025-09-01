import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  selector: 'app-payment-aging-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-aging-reports.component.html',
  styleUrl: './payment-aging-reports.component.css'
})
export class PaymentAgingReportsComponent implements OnInit {
  paymentData: PaymentAgingItem[] = [];
  summary: PaymentSummary | null = null;
  loading = false;
  error: string | null = null;


  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPaymentAgingData();
  }

  async loadPaymentAgingData() {
    this.loading = true;
    this.error = null;

    try {
      console.log('Loading payment aging data...');
      
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      const response = await this.http.get<any>('http://localhost:3001/api/vendor/payment-aging', { headers }).toPromise();
      console.log('Payment aging response:', response);
      console.log('Response success:', response?.success);
      console.log('Response data:', response?.data);
      console.log('Response data length:', response?.data?.length);
      
      if (response && response.success && response.data) {
        this.paymentData = response.data;
        this.summary = response.summary;
      } else {
        this.paymentData = [];
        this.summary = null;
        this.error = response?.message || 'No payment aging data found';
      }
      
      console.log('Payment Aging Data loaded:', this.paymentData.length, 'records');
      console.log('Summary:', this.summary);
    } catch (error: any) {
      console.error('Error loading payment aging data:', error);
      this.error = error?.error?.message || 'Failed to load payment aging data from SAP';
    } finally {
      this.loading = false;
    }
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
    console.log('Refreshing payment aging data...');
    this.loadPaymentAgingData();
  }

  trackByDocumentNumber(index: number, item: PaymentAgingItem): string {
    return item.documentNumber;
  }
}
