import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Simplified Dashboard for Testing -->
      <div class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-content">
            <h1>{{ getPageTitle() }}</h1>
            <div class="user-info">
              <span>Welcome, {{ username }}!</span>
              <button class="logout-btn" (click)="logout()">Logout</button>
            </div>
          </div>
        </header>
        
        <!-- Content Area -->
        <div class="content-area">
          <!-- Dashboard Content -->
          <div class="dashboard-view">
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
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      height: 100vh;
      background-color: #f5f7fa;
    }
    
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: white;
      border-bottom: 1px solid #e1e8ed;
      padding: 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
    }
    
    .header h1 {
      margin: 0;
      color: #333;
      font-size: 1.8rem;
      font-weight: 500;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .user-info span {
      color: #666;
      font-weight: 500;
    }
    
    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }
    
    .logout-btn:hover {
      background: #c82333;
    }
    
    .content-area {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }
    
    .summary-tiles {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .tile {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .tile-content h3 {
      margin: 0 0 5px 0;
      font-size: 2rem;
      font-weight: 600;
      color: #333;
    }
    
    .tile-content p {
      margin: 0;
      color: #666;
      font-weight: 500;
    }
    
    .tile-icon {
      font-size: 2.5rem;
      opacity: 0.7;
    }
    
    .widgets-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
    }
    
    .widget {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .widget h4 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .activities-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .activities-list li {
      padding: 12px 0;
      border-bottom: 1px solid #f1f3f4;
      color: #555;
      font-size: 14px;
    }
    
    .activities-list li:last-child {
      border-bottom: none;
    }
    
    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }
    
    .action-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    
    .profile-view, .rfqs-view, .pos-view, .grs-view, .financials-view {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .profile-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }
    
    .profile-card p {
      margin: 10px 0;
      color: #555;
    }
  `]
})
export class DashboardComponent implements OnInit {
  username: string = '';
  activeView: string = 'dashboard'; // Updated for testing

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const userInfo = this.authService.getUserInfo();
    this.username = userInfo?.vendorId || 'Vendor';
  }

  onMenuItemSelected(action: string) {
    this.activeView = action;
  }

  navigateToSection(section: string) {
    this.activeView = section;
  }

  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'profile': 'Vendor Profile',
      'rfqs': 'Request for Quotations',
      'pos': 'Purchase Orders',
      'grs': 'Goods Receipt',
      'financials': 'Financials'
    };
    return titles[this.activeView] || 'Dashboard';
  }

  logout() {
    this.authService.logout();
  }
}
