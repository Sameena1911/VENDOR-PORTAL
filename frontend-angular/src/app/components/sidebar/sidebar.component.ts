import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>Vendor Portal</h3>
      </div>

      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li *ngFor="let item of menuItems"
              class="nav-item"
              [class.active]="activeItem === item.label"
              (click)="onItemClick(item)">
            <div class="nav-link">
              <i class="icon">{{ item.icon }}</i>
              <span class="nav-text">{{ item.label }}</span>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      overflow-y: auto;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }

    .sidebar-header h3 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: white;
    }

    .sidebar-nav {
      padding: 20px 0;
    }

    .nav-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin: 2px 0;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.2);
      border-right: 4px solid white;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      text-decoration: none;
      color: white;
    }

    .icon {
      width: 20px;
      font-style: normal;
      margin-right: 15px;
      text-align: center;
      font-size: 18px;
    }

    .nav-text {
      font-size: 14px;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Output() menuItemSelected = new EventEmitter<string>();

  activeItem = 'Dashboard';

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: '📊', action: 'dashboard' },
    { label: 'Vendor Profile', icon: '👤', action: 'vendor-profile' },
    { label: 'RFQs', icon: '📋', action: 'rfqs' },
    { label: 'Purchase Orders', icon: '📦', action: 'pos' },
    { label: 'Goods Receipt', icon: '📥', action: 'grs' },
    { label: 'Financials', icon: '💰', action: 'financials' }
  ];

  constructor(private router: Router) {}

  onItemClick(item: MenuItem): void {
    this.activeItem = item.label;
    if (item.action) {
      this.menuItemSelected.emit(item.action);
    }
  }
}
