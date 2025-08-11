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
  
  // Pagination properties - fixed at 10 items per page
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Math reference for template
  Math = Math;

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
      this.updatePagination();
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
    return this.paymentData;
  }

  getPaginatedData(): PaymentAgingItem[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.paymentData.slice(startIndex, endIndex);
  }

  updatePagination() {
    this.totalItems = this.paymentData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Reset to first page if current page is beyond total pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToFirstPage() {
    this.currentPage = 1;
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, this.currentPage - 2);
      const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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
