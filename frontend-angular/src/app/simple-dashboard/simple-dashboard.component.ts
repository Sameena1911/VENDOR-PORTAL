import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services';

@Component({
  selector: 'app-simple-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Fixed Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-text">Vendor Portal</span>
          </div>
        </div>
        
        <nav class="nav-menu">
          <ul>
            <li [class.active]="activeTab === 'home'">
              <a (click)="setActiveTab('home')" class="nav-link">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">Home</span>
              </a>
            </li>
            <li [class.active]="activeTab === 'rfq'">
              <a (click)="setActiveTab('rfq')" class="nav-link">
                <span class="nav-icon">📋</span>
                <span class="nav-text">Request for Quotation</span>
              </a>
            </li>
            <li [class.active]="activeTab === 'po'">
              <a (click)="setActiveTab('po')" class="nav-link">
                <span class="nav-icon">📦</span>
                <span class="nav-text">Purchase Order</span>
              </a>
            </li>
            <li [class.active]="activeTab === 'gr'">
              <a (click)="setActiveTab('gr')" class="nav-link">
                <span class="nav-icon">📥</span>
                <span class="nav-text">Goods Receipt</span>
              </a>
            </li>
            <li [class.active]="activeTab === 'invoice'">
              <a (click)="setActiveTab('invoice')" class="nav-link">
                <span class="nav-icon">📄</span>
                <span class="nav-text">Invoice Details</span>
              </a>
            </li>
            <li [class.active]="activeTab === 'payment'">
              <a (click)="setActiveTab('payment')" class="nav-link">
                <span class="nav-icon">💳</span>
                <span class="nav-text">Payment and Aging</span>
              </a>
            </li>
            <li [class.active]="activeTab === 'memo'">
              <a (click)="setActiveTab('memo')" class="nav-link">
                <span class="nav-icon">📝</span>
                <span class="nav-text">Credit Debit Memo</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Top Header -->
        <header class="header">
          <div class="header-content">
            <h1>{{ getPageTitle() }}</h1>
            <div class="header-actions">
              <button class="notification-btn">
                <span class="notification-icon">🔔</span>
                <span class="notification-badge">3</span>
              </button>
              <div class="user-info">
                <span class="welcome-text">Welcome, {{ username }}!</span>
                <button class="logout-btn" (click)="logout()" title="Logout from Vendor Portal">
                  <span class="logout-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Dynamic Content Area -->
        <div class="content-area">
          <!-- Home Tab Content -->
          <div *ngIf="activeTab === 'home'" class="home-content">
            <div class="vendor-profile">
              <div class="profile-card">
                <h3>Vendor Profile Information</h3>
                <div class="profile-details">
                  <div class="detail-row">
                    <span class="label">Vendor ID:</span>
                    <span class="value">{{ username }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Company Name:</span>
                    <span class="value">{{ vendorInfo.companyName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Email:</span>
                    <span class="value">{{ vendorInfo.email }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Phone:</span>
                    <span class="value">{{ vendorInfo.phone }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Address:</span>
                    <span class="value">{{ vendorInfo.address }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value status active">Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="summary-tiles">
              <div class="tile">
                <div class="tile-content">
                  <h3>12</h3>
                  <p>Active RFQs</p>
                </div>
                <div class="tile-icon">📋</div>
              </div>
              
              <div class="tile">
                <div class="tile-content">
                  <h3>8</h3>
                  <p>Pending POs</p>
                </div>
                <div class="tile-icon">📦</div>
              </div>
              
              <div class="tile">
                <div class="tile-content">
                  <h3>15</h3>
                  <p>Goods Receipts</p>
                </div>
                <div class="tile-icon">📥</div>
              </div>
              
              <div class="tile">
                <div class="tile-content">
                  <h3>₹2.5L</h3>
                  <p>Outstanding</p>
                </div>
                <div class="tile-icon">💰</div>
              </div>
            </div>
          </div>

          <!-- RFQ Tab Content -->
          <div *ngIf="activeTab === 'rfq'" class="tab-content">
            <div class="content-card">
              <h3>Request for Quotation</h3>
              <p>Manage your RFQ submissions and responses here.</p>
              <div class="placeholder-content">
                <div class="feature-coming-soon">
                  <span class="icon">📋</span>
                  <h4>RFQ Management</h4>
                  <p>View and respond to requests for quotation</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Purchase Order Tab Content -->
          <div *ngIf="activeTab === 'po'" class="tab-content">
            <div class="content-card">
              <h3>Purchase Orders</h3>
              <p>View and manage your purchase orders.</p>
              <div class="placeholder-content">
                <div class="feature-coming-soon">
                  <span class="icon">📦</span>
                  <h4>Purchase Order Management</h4>
                  <p>Track and manage your purchase orders</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Goods Receipt Tab Content -->
          <div *ngIf="activeTab === 'gr'" class="tab-content">
            <div class="content-card">
              <h3>Goods Receipt</h3>
              <p>Manage goods receipt documentation.</p>
              <div class="placeholder-content">
                <div class="feature-coming-soon">
                  <span class="icon">📥</span>
                  <h4>Goods Receipt Processing</h4>
                  <p>Process and track goods receipts</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Invoice Tab Content -->
          <div *ngIf="activeTab === 'invoice'" class="tab-content">
            <div class="content-card">
              <h3>Invoice Details</h3>
              <p>View and manage invoice information.</p>
              <div class="placeholder-content">
                <div class="feature-coming-soon">
                  <span class="icon">📄</span>
                  <h4>Invoice Management</h4>
                  <p>Track invoice status and details</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Tab Content -->
          <div *ngIf="activeTab === 'payment'" class="tab-content">
            <div class="content-card">
              <h3>Payment and Aging</h3>
              <p>Monitor payment status and aging reports.</p>
              <div class="placeholder-content">
                <div class="feature-coming-soon">
                  <span class="icon">💳</span>
                  <h4>Payment Tracking</h4>
                  <p>View payment status and aging analysis</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Credit Debit Memo Tab Content -->
          <div *ngIf="activeTab === 'memo'" class="tab-content">
            <div class="content-card">
              <h3>Credit Debit Memo</h3>
              <p>Manage credit and debit memo transactions.</p>
              <div class="placeholder-content">
                <div class="feature-coming-soon">
                  <span class="icon">📝</span>
                  <h4>Memo Management</h4>
                  <p>Handle credit and debit memo processing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    .dashboard-container {
      display: flex;
      height: 100vh;
      background-color: #f8f9fa;
    }
    
    /* Fixed Sidebar */
    .sidebar {
      width: 280px;
      background: #0057D2;
      color: white;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 2px 0 10px rgba(0, 87, 210, 0.1);
    }
    
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }
    
    .logo-text {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
    }
    
    .nav-menu {
      padding: 20px 0;
    }
    
    .nav-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .nav-menu li {
      margin: 0;
    }
    
    .nav-link {
      display: flex;
      align-items: center;
      padding: 15px 25px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
    }
    
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .nav-menu li.active .nav-link {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border-left-color: white;
    }
    
    .nav-icon {
      font-size: 1.2rem;
      margin-right: 15px;
      width: 20px;
      text-align: center;
    }
    
    .nav-text {
      font-size: 14px;
      font-weight: 500;
    }
    
    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    
    /* Header */
    .header {
      background: white;
      border-bottom: 1px solid #e1e8ed;
      position: sticky;
      top: 0;
      z-index: 999;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
    }
    
    .header h1 {
      margin: 0;
      color: #0057D2;
      font-size: 1.8rem;
      font-weight: 600;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .notification-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background-color 0.3s ease;
    }
    
    .notification-btn:hover {
      background: #f8f9fa;
    }
    
    .notification-icon {
      font-size: 1.3rem;
      color: #666;
    }
    
    .notification-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #dc3545;
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .welcome-text {
      color: #666;
      font-weight: 500;
      font-size: 14px;
    }
    
    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .logout-btn:hover {
      background: #c82333;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    }
    
    .logout-icon {
      font-size: 12px;
    }
    
    /* Content Area */
    .content-area {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
      background: #f8f9fa;
    }
    
    /* Home Content */
    .home-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    .vendor-profile {
      margin-bottom: 30px;
    }
    
    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #0057D2;
    }
    
    .profile-card h3 {
      margin: 0 0 25px 0;
      color: #0057D2;
      font-size: 1.3rem;
      font-weight: 600;
    }
    
    .profile-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f1f3f4;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 600;
      color: #333;
      flex: 0 0 120px;
    }
    
    .value {
      color: #666;
      flex: 1;
      text-align: right;
    }
    
    .status.active {
      color: #28a745;
      font-weight: 600;
    }
    
    /* Summary Tiles */
    .summary-tiles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .tile {
      background: white;
      border-radius: 12px;
      padding: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-top: 4px solid #0057D2;
    }
    
    .tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 87, 210, 0.2);
    }
    
    .tile-content h3 {
      margin: 0 0 5px 0;
      font-size: 2.2rem;
      font-weight: 700;
      color: #0057D2;
    }
    
    .tile-content p {
      margin: 0;
      color: #666;
      font-weight: 500;
      font-size: 14px;
    }
    
    .tile-icon {
      font-size: 2.5rem;
      opacity: 0.7;
    }
    
    /* Tab Content */
    .tab-content {
      animation: fadeIn 0.3s ease-in;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .content-card {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #0057D2;
    }
    
    .content-card h3 {
      margin: 0 0 10px 0;
      color: #0057D2;
      font-size: 1.4rem;
      font-weight: 600;
    }
    
    .content-card p {
      margin: 0 0 30px 0;
      color: #666;
      font-size: 16px;
    }
    
    .placeholder-content {
      text-align: center;
      padding: 40px 20px;
    }
    
    .feature-coming-soon {
      max-width: 400px;
      margin: 0 auto;
    }
    
    .feature-coming-soon .icon {
      font-size: 4rem;
      margin-bottom: 20px;
      display: block;
      opacity: 0.6;
    }
    
    .feature-coming-soon h4 {
      color: #0057D2;
      font-size: 1.2rem;
      margin: 0 0 10px 0;
      font-weight: 600;
    }
    
    .feature-coming-soon p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .sidebar {
        width: 250px;
      }
      
      .main-content {
        margin-left: 250px;
      }
      
      .header-content {
        padding: 15px 20px;
      }
      
      .content-area {
        padding: 20px;
      }
      
      .profile-details {
        grid-template-columns: 1fr;
      }
      
      .summary-tiles {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }
    }
  `]
})
export class SimpleDashboardComponent implements OnInit {
  username: string = '';
  activeTab: string = 'home';
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getPageTitle(): string {
    switch (this.activeTab) {
      case 'home': return 'Dashboard Overview';
      case 'rfq': return 'Request for Quotation';
      case 'po': return 'Purchase Orders';
      case 'gr': return 'Goods Receipt';
      case 'invoice': return 'Invoice Details';
      case 'payment': return 'Payment and Aging';
      case 'memo': return 'Credit Debit Memo';
      default: return 'Vendor Portal';
    }
  }

  logout() {
    // Show loading state (optional)
    this.authService.logout();
    // Navigation is handled in AuthService
  }
}
