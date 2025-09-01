import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface PurchaseOrder {
  poNumber: string;
  vendorId: string;
  matnr: string;
  meins: string;
  poDate: string;
  edd: string;
  currency: string;
}

interface POSummary {
  totalCount: number;
  openCount: number;
  dueSoonCount: number;
  overdueCount: number;
}

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.css']
})
export class PurchaseOrderComponent implements OnInit {
  purchaseOrders: PurchaseOrder[] = [];
  filteredPurchaseOrders: PurchaseOrder[] = [];
  summary: POSummary = {
    totalCount: 0,
    openCount: 0,
    dueSoonCount: 0,
    overdueCount: 0
  };
  
  isLoading = false;
  error: string | null = null;
  
  // Filter properties
  filterDateFrom = '';
  filterDateTo = '';
  searchText = '';
  
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPurchaseOrders();
  }

  async loadPurchaseOrders() {
    this.isLoading = true;
    this.error = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const response = await this.http.get<any>(`${this.apiUrl}/vendor/purchase-orders`, { headers }).toPromise();
      
      if (response && response.purchaseOrders) {
        this.purchaseOrders = response.purchaseOrders;
        this.filteredPurchaseOrders = [...this.purchaseOrders];
        this.summary = response.summary || this.calculateSummary();
        console.log('Loaded purchase orders:', this.purchaseOrders.length);
      } else {
        this.purchaseOrders = [];
        this.filteredPurchaseOrders = [];
        this.error = 'No purchase order data received';
      }

    } catch (error: any) {
      console.error('Error loading purchase orders:', error);
      this.error = error.error?.message || error.message || 'Failed to load purchase orders';
      this.purchaseOrders = [];
      this.filteredPurchaseOrders = [];
    } finally {
      this.isLoading = false;
    }
  }

  calculateSummary(): POSummary {
    const summary: POSummary = {
      totalCount: 0,
      openCount: 0,
      dueSoonCount: 0,
      overdueCount: 0
    };

    const today = new Date();
    const dueSoonThreshold = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    this.purchaseOrders.forEach(po => {
      summary.totalCount++;

      const eddDate = new Date(po.edd);
      
      if (eddDate < today) {
        summary.overdueCount++;
      } else if (eddDate <= dueSoonThreshold) {
        summary.dueSoonCount++;
      } else {
        summary.openCount++;
      }
    });

    return summary;
  }

  filterPurchaseOrders() {
    this.filteredPurchaseOrders = this.purchaseOrders.filter(po => {
      let matches = true;

      // Date range filter
      if (this.filterDateFrom && po.poDate < this.filterDateFrom) {
        matches = false;
      }
      if (this.filterDateTo && po.poDate > this.filterDateTo) {
        matches = false;
      }

      // Search text filter
      if (this.searchText) {
        const search = this.searchText.toLowerCase();
        const searchFields = [
          po.poNumber,
          po.vendorId
        ].join(' ').toLowerCase();
        
        if (!searchFields.includes(search)) {
          matches = false;
        }
      }

      return matches;
    });
  }

  clearFilters() {
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.searchText = '';
    this.filteredPurchaseOrders = [...this.purchaseOrders];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  refresh() {
    this.loadPurchaseOrders();
  }
}
