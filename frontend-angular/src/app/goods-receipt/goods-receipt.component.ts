import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface GoodsReceipt {
  grNumber: string;
  grYear: string;
  vendorId: string;
  grDate: string;
  material: string;
  description: string;
  storageLocation: string;
  movementType: string;
  documentDate: string;
  postingDate: string;
  deliveryNote: string;
  billOfLading: string;
}

interface GRSummary {
  totalCount: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

@Component({
  selector: 'app-goods-receipt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.css']
})
export class GoodsReceiptComponent implements OnInit {
  goodsReceipts: GoodsReceipt[] = [];
  filteredGoodsReceipts: GoodsReceipt[] = [];
  summary: GRSummary = {
    totalCount: 0,
    todayCount: 0,
    weekCount: 0,
    monthCount: 0
  };

  // Filter properties
  searchTerm: string = '';
  selectedPeriod: string = '';
  startDate: string = '';
  endDate: string = '';

  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoodsReceipts();
  }

  loadGoodsReceipts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'Authentication token not found';
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // API endpoint for goods receipts
    this.http.get<any>('http://localhost:3001/api/vendor/goods-receipts', { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.goodsReceipts = response.data || this.getMockGoodsReceipts();
          } else {
            this.goodsReceipts = this.getMockGoodsReceipts();
          }
          this.filteredGoodsReceipts = [...this.goodsReceipts];
          this.calculateSummary();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading goods receipts:', error);
          this.goodsReceipts = this.getMockGoodsReceipts();
          this.filteredGoodsReceipts = [...this.goodsReceipts];
          this.calculateSummary();
          this.isLoading = false;
        }
      });
  }

  getMockGoodsReceipts(): GoodsReceipt[] {
    return [
      {
        grNumber: '5000000000',
        grYear: '2025',
        vendorId: '100000',
        grDate: '2025-06-02',
        material: '13',
        description: 'Material 13 - Industrial Component',
        storageLocation: 'SL01',
        movementType: '101',
        documentDate: '2025-06-02',
        postingDate: '2025-06-02',
        deliveryNote: 'DN12345',
        billOfLading: 'BL67890'
      },
      {
        grNumber: '5000000001',
        grYear: '2025',
        vendorId: '100000',
        grDate: '2025-06-02',
        material: '13',
        description: 'Material 13 - Industrial Component',
        storageLocation: 'SL02',
        movementType: '101',
        documentDate: '2025-06-02',
        postingDate: '2025-06-02',
        deliveryNote: 'DN12346',
        billOfLading: 'BL67891'
      },
      {
        grNumber: '5000000002',
        grYear: '2025',
        vendorId: '100000',
        grDate: '2025-06-02',
        material: '13',
        description: 'Material 13 - Industrial Component',
        storageLocation: 'SL01',
        movementType: '101',
        documentDate: '2025-06-02',
        postingDate: '2025-06-02',
        deliveryNote: 'DN12347',
        billOfLading: 'BL67892'
      },
      {
        grNumber: '5000000003',
        grYear: '2025',
        vendorId: '100000',
        grDate: '2025-06-02',
        material: '13',
        description: 'Material 13 - Industrial Component',
        storageLocation: 'SL03',
        movementType: '101',
        documentDate: '2025-06-02',
        postingDate: '2025-06-02',
        deliveryNote: 'DN12348',
        billOfLading: 'BL67893'
      },
      {
        grNumber: '5000000004',
        grYear: '2025',
        vendorId: '100000',
        grDate: '2025-06-02',
        material: '13',
        description: 'Material 13 - Industrial Component',
        storageLocation: 'SL04',
        movementType: '101',
        documentDate: '2025-06-02',
        postingDate: '2025-06-02',
        deliveryNote: 'DN12349',
        billOfLading: 'BL67894'
      }
    ];
  }

  filterGoodsReceipts(): void {
    this.filteredGoodsReceipts = this.goodsReceipts.filter(gr => {
      let matchesSearch = true;
      let matchesPeriod = true;
      let matchesDateRange = true;

      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        matchesSearch = 
          gr.grNumber.toLowerCase().includes(searchLower) ||
          gr.material.toLowerCase().includes(searchLower) ||
          gr.description.toLowerCase().includes(searchLower) ||
          gr.deliveryNote.toLowerCase().includes(searchLower);
      }

      // Period filter
      if (this.selectedPeriod) {
        const grDate = new Date(gr.grDate);
        const now = new Date();
        
        switch (this.selectedPeriod) {
          case 'today':
            matchesPeriod = grDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesPeriod = grDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesPeriod = grDate >= monthAgo;
            break;
        }
      }

      // Date range filter
      if (this.startDate && this.endDate) {
        const grDate = new Date(gr.grDate);
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        matchesDateRange = grDate >= start && grDate <= end;
      }

      return matchesSearch && matchesPeriod && matchesDateRange;
    });

    this.calculateSummary();
  }

  calculateSummary(): void {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.summary = {
      totalCount: this.filteredGoodsReceipts.length,
      todayCount: this.filteredGoodsReceipts
        .filter(gr => new Date(gr.grDate).toDateString() === now.toDateString()).length,
      weekCount: this.filteredGoodsReceipts
        .filter(gr => new Date(gr.grDate) >= weekAgo).length,
      monthCount: this.filteredGoodsReceipts
        .filter(gr => new Date(gr.grDate) >= monthAgo).length
    };
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedPeriod = '';
    this.startDate = '';
    this.endDate = '';
    this.filteredGoodsReceipts = [...this.goodsReceipts];
    this.calculateSummary();
  }

  exportToCSV(): void {
    const headers = [
      'GR Number', 'GR Year', 'GR Date', 'Material', 'Description', 'Storage Location'
    ];

    const csvContent = [
      headers.join(','),
      ...this.filteredGoodsReceipts.map(gr => [
        gr.grNumber,
        gr.grYear,
        gr.grDate,
        gr.material,
        `"${gr.description}"`,
        gr.storageLocation
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goods_receipts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  trackByGrNumber(index: number, item: GoodsReceipt): string {
    return item.grNumber;
  }
}
