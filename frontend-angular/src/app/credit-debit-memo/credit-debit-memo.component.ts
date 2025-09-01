import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface CreditDebitMemo {
  vendorId: string;
  documentNumber: string;
  fiscalYear: string;
  lineItem: string;
  documentType: string;
  postingDate: string;
  documentDate: string;
  amount: number;
  currency: string;
  quantity: number;
  unit: string;
  material: string;
  glAccount: string;
  debitCreditIndicator: string;
  postingKey: string;
  type: 'DEBIT' | 'CREDIT';
  status: string;
  description: string;
}

export interface MemoSummary {
  debit: {
    count: number;
    totalAmount: number;
    byType: { [key: string]: { count: number; amount: number } };
  };
  credit: {
    count: number;
    totalAmount: number;
    byType: { [key: string]: { count: number; amount: number } };
  };
  netAmount: number;
  total: {
    count: number;
    totalAmount: number;
  };
}

@Component({
  selector: 'app-credit-debit-memo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="credit-debit-memo-container">
      <div class="header">
        <h1>📝 Credit & Debit Memo</h1>
        <p>Manage and view your credit and debit memo transactions</p>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading memo data from SAP...</p>
      </div>

      <!-- Error Message -->
      <div *ngIf="error && !loading" class="error-container">
        <div class="error-card">
          <h3>⚠️ Error Loading Data</h3>
          <p>{{ error }}</p>
          <button class="retry-btn" (click)="loadMemoData()">
            🔄 Retry
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div *ngIf="!loading && !error && summary" class="summary-section">
        <div class="summary-cards">
          <div class="summary-card debit-card">
            <div class="card-header">
              <span class="icon">🔻</span>
              <h3>Total Debit</h3>
            </div>
            <div class="card-amount">{{ summary.debit.totalAmount | currency:'INR':'symbol':'1.2-2' }}</div>
            <div class="card-count">{{ summary.debit.count }} transactions</div>
          </div>

          <div class="summary-card credit-card">
            <div class="card-header">
              <span class="icon">🔺</span>
              <h3>Total Credit</h3>
            </div>
            <div class="card-amount">{{ summary.credit.totalAmount | currency:'INR':'symbol':'1.2-2' }}</div>
            <div class="card-count">{{ summary.credit.count }} transactions</div>
          </div>

          <div class="summary-card net-card" [ngClass]="{'positive': summary.netAmount >= 0, 'negative': summary.netAmount < 0}">
            <div class="card-header">
              <span class="icon">{{ summary.netAmount >= 0 ? '📈' : '📉' }}</span>
              <h3>Net Amount</h3>
            </div>
            <div class="card-amount">{{ summary.netAmount | currency:'INR':'symbol':'1.2-2' }}</div>
            <div class="card-count">{{ summary.total.count }} total transactions</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div *ngIf="!loading && !error" class="filters-section">
        <div class="filters">
          <div class="filter-group">
            <label for="typeFilter">Filter by Type:</label>
            <select id="typeFilter" [(ngModel)]="selectedFilter" (change)="applyFilters()">
              <option value="ALL">All Memos</option>
              <option value="DEBIT">Debit Memos Only</option>
              <option value="CREDIT">Credit Memos Only</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="statusFilter">Filter by Status:</label>
            <select id="statusFilter" [(ngModel)]="selectedStatus" (change)="applyFilters()">
              <option value="">All Status</option>
              <option value="Goods Receipt">Goods Receipt</option>
              <option value="Invoice Receipt">Invoice Receipt</option>
              <option value="Vendor Credit Memo">Vendor Credit Memo</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="searchText">Search:</label>
            <input id="searchText" type="text" [(ngModel)]="searchText" (input)="applyFilters()" 
                   placeholder="Document number, material...">
          </div>

          <button class="clear-btn" (click)="clearFilters()">
            🗑️ Clear Filters
          </button>
        </div>
      </div>

      <!-- Memo Data Tables -->
      <div *ngIf="!loading && !error" class="memo-tables">
        <div class="tab-container">
          <div class="tab-header">
            <button class="tab-btn" [class.active]="selectedTab === 'all'" (click)="selectedTab = 'all'">
              All Memos ({{ filteredData.length }})
            </button>
            <button class="tab-btn" [class.active]="selectedTab === 'debit'" (click)="selectedTab = 'debit'">
              Debit Memos ({{ debitMemos.length }})
            </button>
            <button class="tab-btn" [class.active]="selectedTab === 'credit'" (click)="selectedTab = 'credit'">
              Credit Memos ({{ creditMemos.length }})
            </button>
          </div>

          <div class="tab-content">
            <!-- All Memos Table -->
            <div *ngIf="selectedTab === 'all'" class="table-container">
              <div *ngIf="filteredData.length === 0" class="no-data">
                <h3>📭 No memo data found</h3>
                <p>{{ allMemos.length > 0 ? 'Try adjusting your filters' : 'No memo transactions available' }}</p>
              </div>
              
              <table *ngIf="filteredData.length > 0" class="memo-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Document #</th>
                    <th>Fiscal Year</th>
                    <th>Doc Type</th>
                    <th>Posting Date</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>GL Account</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let memo of filteredData">
                    <td>
                      <span class="type-chip" [ngClass]="{'debit-chip': memo.type === 'DEBIT', 'credit-chip': memo.type === 'CREDIT'}">
                        {{ memo.type }}
                      </span>
                    </td>
                    <td>{{ memo.documentNumber }}</td>
                    <td>{{ memo.fiscalYear }}</td>
                    <td>{{ memo.documentType }}</td>
                    <td>{{ memo.postingDate }}</td>
                    <td class="amount" [ngClass]="{'debit-amount': memo.type === 'DEBIT', 'credit-amount': memo.type === 'CREDIT'}">
                      {{ memo.amount | currency:memo.currency:'symbol':'1.2-2' }}
                    </td>
                    <td>{{ memo.currency }}</td>
                    <td>{{ memo.material || '-' }}</td>
                    <td>{{ memo.quantity > 0 ? (memo.quantity + ' ' + memo.unit) : '-' }}</td>
                    <td>{{ memo.glAccount || '-' }}</td>
                    <td>{{ memo.status }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Debit Memos Table -->
            <div *ngIf="selectedTab === 'debit'" class="table-container">
              <table *ngIf="debitMemos.length > 0" class="memo-table">
                <thead>
                  <tr>
                    <th>Document #</th>
                    <th>Fiscal Year</th>
                    <th>Doc Type</th>
                    <th>Posting Date</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>GL Account</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let memo of debitMemos">
                    <td>{{ memo.documentNumber }}</td>
                    <td>{{ memo.fiscalYear }}</td>
                    <td>{{ memo.documentType }}</td>
                    <td>{{ memo.postingDate }}</td>
                    <td class="amount debit-amount">{{ memo.amount | currency:memo.currency:'symbol':'1.2-2' }}</td>
                    <td>{{ memo.currency }}</td>
                    <td>{{ memo.material || '-' }}</td>
                    <td>{{ memo.quantity > 0 ? (memo.quantity + ' ' + memo.unit) : '-' }}</td>
                    <td>{{ memo.glAccount || '-' }}</td>
                    <td>{{ memo.status }}</td>
                  </tr>
                </tbody>
              </table>
              <div *ngIf="debitMemos.length === 0" class="no-data">
                <h3>📭 No debit memos found</h3>
              </div>
            </div>

            <!-- Credit Memos Table -->
            <div *ngIf="selectedTab === 'credit'" class="table-container">
              <table *ngIf="creditMemos.length > 0" class="memo-table">
                <thead>
                  <tr>
                    <th>Document #</th>
                    <th>Fiscal Year</th>
                    <th>Doc Type</th>
                    <th>Posting Date</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>GL Account</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let memo of creditMemos">
                    <td>{{ memo.documentNumber }}</td>
                    <td>{{ memo.fiscalYear }}</td>
                    <td>{{ memo.documentType }}</td>
                    <td>{{ memo.postingDate }}</td>
                    <td class="amount credit-amount">{{ memo.amount | currency:memo.currency:'symbol':'1.2-2' }}</td>
                    <td>{{ memo.currency }}</td>
                    <td>{{ memo.material || '-' }}</td>
                    <td>{{ memo.quantity > 0 ? (memo.quantity + ' ' + memo.unit) : '-' }}</td>
                    <td>{{ memo.glAccount || '-' }}</td>
                    <td>{{ memo.status }}</td>
                  </tr>
                </tbody>
              </table>
              <div *ngIf="creditMemos.length === 0" class="no-data">
                <h3>📭 No credit memos found</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .credit-debit-memo-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: Arial, sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin: 0;
      color: #1976d2;
      font-size: 2rem;
    }

    .header p {
      color: #666;
      margin: 10px 0 0 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      gap: 20px;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #1976d2;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      display: flex;
      justify-content: center;
      margin: 40px 0;
    }

    .error-card {
      text-align: center;
      padding: 30px;
      max-width: 400px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .error-card h3 {
      color: #f44336;
      margin-bottom: 15px;
    }

    .retry-btn {
      background: #1976d2;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .retry-btn:hover {
      background: #1565c0;
    }

    .summary-section {
      margin-bottom: 30px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .summary-card .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .summary-card .card-header .icon {
      font-size: 24px;
    }

    .summary-card .card-header h3 {
      margin: 0;
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-card .card-amount {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .summary-card .card-count {
      color: #666;
      font-size: 12px;
    }

    .debit-card {
      border-left: 4px solid #f44336;
    }

    .debit-card .card-amount {
      color: #f44336;
    }

    .credit-card {
      border-left: 4px solid #4caf50;
    }

    .credit-card .card-amount {
      color: #4caf50;
    }

    .net-card.positive {
      border-left: 4px solid #4caf50;
    }

    .net-card.positive .card-amount {
      color: #4caf50;
    }

    .net-card.negative {
      border-left: 4px solid #f44336;
    }

    .net-card.negative .card-amount {
      color: #f44336;
    }

    .filters-section {
      margin-bottom: 20px;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      align-items: end;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-weight: bold;
      color: #333;
      font-size: 14px;
    }

    .filter-group select,
    .filter-group input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .clear-btn {
      background: #ff9800;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .clear-btn:hover {
      background: #f57c00;
    }

    .memo-tables {
      margin-top: 20px;
    }

    .tab-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .tab-header {
      display: flex;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 15px 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
    }

    .tab-btn:hover {
      background: #e0e0e0;
      color: #333;
    }

    .tab-btn.active {
      color: #1976d2;
      border-bottom-color: #1976d2;
      background: white;
    }

    .tab-content {
      padding: 20px;
    }

    .table-container {
      overflow-x: auto;
      max-height: 600px;
      overflow-y: auto;
    }

    .memo-table {
      width: 100%;
      min-width: 800px;
      border-collapse: collapse;
      font-size: 14px;
    }

    .memo-table th {
      background-color: #f5f5f5;
      font-weight: bold;
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 12px 8px;
      border-bottom: 2px solid #ddd;
      text-align: left;
    }

    .memo-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #e0e0e0;
    }

    .memo-table tr:hover {
      background-color: #f9f9f9;
    }

    .type-chip {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .debit-chip {
      background-color: #ffebee;
      color: #c62828;
    }

    .credit-chip {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .amount {
      font-weight: bold;
      text-align: right;
    }

    .debit-amount {
      color: #f44336;
    }

    .credit-amount {
      color: #4caf50;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      text-align: center;
      color: #666;
    }

    .no-data h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }

    .no-data p {
      margin: 0;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .credit-debit-memo-container {
        padding: 10px;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }

      .filters {
        grid-template-columns: 1fr;
      }

      .memo-table {
        min-width: 600px;
        font-size: 12px;
      }

      .tab-header {
        flex-direction: column;
      }

      .tab-btn {
        text-align: left;
      }
    }
  `]
})
export class CreditDebitMemoComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  // Data
  debitMemos: CreditDebitMemo[] = [];
  creditMemos: CreditDebitMemo[] = [];
  allMemos: CreditDebitMemo[] = [];
  filteredData: CreditDebitMemo[] = [];
  summary: MemoSummary | null = null;
  
  // Filters
  selectedFilter = 'ALL';
  selectedStatus = '';
  searchText = '';
  selectedTab = 'all';
  
  // Table columns
  displayedColumns = ['type', 'documentNumber', 'documentType', 'postingDate', 'amount', 'status', 'material', 'quantity', 'description'];
  debitColumns = ['documentNumber', 'documentType', 'postingDate', 'amount', 'status', 'material', 'quantity', 'description'];
  creditColumns = ['documentNumber', 'documentType', 'postingDate', 'amount', 'status', 'material', 'quantity', 'description'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMemoData();
  }

  loadMemoData(): void {
    this.loading = true;
    this.error = null;

    this.loadMemoDataAsync();
  }

  async loadMemoDataAsync(): Promise<void> {
    try {
      console.log('Loading credit/debit memo data...');
      
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      
      const response = await this.http.get<any>('http://localhost:3001/api/vendor/credit-debit-memo', { headers }).toPromise();
      console.log('Credit/Debit Memo API Response:', response);
      console.log('Debit Memos:', response?.debitMemos);
      console.log('Credit Memos:', response?.creditMemos);
      console.log('Summary:', response?.summary);
      
      if (response && (response.debitMemos || response.creditMemos)) {
        // Backend already separates debit and credit memos
        this.debitMemos = response.debitMemos || [];
        this.creditMemos = response.creditMemos || [];
        
        this.allMemos = [...this.debitMemos, ...this.creditMemos];
        this.summary = response.summary;
      } else {
        this.debitMemos = [];
        this.creditMemos = [];
        this.allMemos = [];
        this.summary = null;
        this.error = response?.message || 'No credit/debit memo data found';
      }
      
      this.applyFilters();
      this.loading = false;
    } catch (error: any) {
      console.error('Error loading credit/debit memo data:', error);
      this.error = error?.error?.message || 'Failed to load credit/debit memo data';
      this.loading = false;
    }
  }

  applyFilters(): void {
    let filtered = [...this.allMemos];

    // Filter by type
    if (this.selectedFilter !== 'ALL') {
      filtered = filtered.filter(memo => memo.type === this.selectedFilter);
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(memo => memo.status === this.selectedStatus);
    }

    // Filter by search text
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(memo => 
        memo.documentNumber.toLowerCase().includes(searchLower) ||
        memo.material.toLowerCase().includes(searchLower) ||
        memo.description.toLowerCase().includes(searchLower) ||
        memo.status.toLowerCase().includes(searchLower)
      );
    }

    // Sort by posting date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.postingDate.split('/').reverse().join('-'));
      const dateB = new Date(b.postingDate.split('/').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    });

    this.filteredData = filtered;
  }

  clearFilters(): void {
    this.selectedFilter = 'ALL';
    this.selectedStatus = '';
    this.searchText = '';
    this.applyFilters();
  }
}
