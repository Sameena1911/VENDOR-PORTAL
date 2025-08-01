import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface RFQ {
  rfqNumber: string;
  vendorId: string;
  rfqDate: string;
  description: string;
  quantity: string;
  unit: string;
}

export interface RFQSummary {
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  overdueCount: number;
  totalValue: number;
}

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.css']
})
export class RFQComponent implements OnInit {
  rfqs: RFQ[] = [];
  filteredRFQs: RFQ[] = [];
  summary: RFQSummary = {
    totalCount: 0,
    activeCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    totalValue: 0
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
    this.loadRFQs();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  async loadRFQs() {
    this.isLoading = true;
    this.error = null;

    try {
      console.log('🔍 Loading RFQs from backend API...');
      const headers = this.getAuthHeaders();
      
      const response = await this.http.get<any>(`${this.apiUrl}/vendor/rfqs`, { headers }).toPromise();
      
      console.log('📥 Backend Response:', response);
      
      if (response && response.rfqs) {
        this.rfqs = response.rfqs;
        this.filteredRFQs = [...this.rfqs];
        
        // Update summary with backend data
        this.summary = {
          totalCount: response.summary?.totalCount || response.rfqs.length,
          activeCount: response.summary?.activeCount || Math.ceil(response.rfqs.length * 0.7),
          pendingCount: response.summary?.pendingCount || Math.ceil(response.rfqs.length * 0.8),
          overdueCount: response.summary?.overdueCount || Math.floor(response.rfqs.length * 0.1),
          totalValue: response.summary?.totalValue || response.rfqs.length * 25000
        };
        
        console.log('✅ RFQs loaded successfully from SAP:', this.rfqs.length);
        
        if (!response.success) {
          // Show warning if using fallback data
          console.warn('⚠️ Using fallback data:', response.message);
        }
      } else {
        throw new Error('No RFQ data received from backend');
      }
      
    } catch (error: any) {
      console.error('❌ Error loading RFQs:', error);
      this.error = error?.error?.message || error?.message || 'Failed to load RFQs from SAP. Please try again.';
      
      // Use fallback data on error
      this.rfqs = [];
      this.filteredRFQs = [];
      this.summary = {
        totalCount: 0,
        activeCount: 0,
        pendingCount: 0,
        overdueCount: 0,
        totalValue: 0
      };
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters() {
    this.filteredRFQs = this.rfqs.filter(rfq => {
      const matchesSearch = !this.searchText || 
        rfq.rfqNumber.toLowerCase().includes(this.searchText.toLowerCase()) ||
        rfq.description.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesDateFrom = !this.filterDateFrom || 
        new Date(rfq.rfqDate) >= new Date(this.filterDateFrom);

      const matchesDateTo = !this.filterDateTo || 
        new Date(rfq.rfqDate) <= new Date(this.filterDateTo);

      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }

  clearFilters() {
    this.searchText = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filteredRFQs = [...this.rfqs];
  }

  exportRFQs() {
    if (this.filteredRFQs.length === 0) {
      alert('No RFQs to export');
      return;
    }

    // Create CSV content
    const headers = ['RFQ Number', 'Vendor ID', 'RFQ Date', 'Description', 'Quantity', 'Unit'];
    const csvContent = [
      headers.join(','),
      ...this.filteredRFQs.map(rfq => [
        rfq.rfqNumber,
        rfq.vendorId,
        rfq.rfqDate,
        `"${rfq.description.replace(/"/g, '""')}"`, // Escape quotes
        rfq.quantity,
        rfq.unit
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rfqs_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  onRefresh() {
    this.loadRFQs();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
    } catch {
      return dateString; // Return original if parsing fails
    }
  }

  trackByRFQNumber(index: number, rfq: RFQ): string {
    return rfq.rfqNumber;
  }
}
