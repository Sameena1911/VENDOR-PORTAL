import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  action?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
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
          <li *ngFor="let item of menuItems" class="nav-item">
            <div class="nav-link"
                 [class.active]="activeItem === item.label"
                 [class.has-children]="item.children && item.children.length > 0"
                 (click)="onItemClick(item)">
              <i class="icon">{{ item.icon }}</i>
              <span class="nav-text">{{ item.label }}</span>
              <i *ngIf="item.children && item.children.length > 0" 
                 class="dropdown-icon"
                 [class.expanded]="item.isExpanded">▼</i>
            </div>
            
            <!-- Dropdown Menu -->
            <ul *ngIf="item.children && item.isExpanded" class="dropdown-menu">
              <li *ngFor="let child of item.children"
                  class="dropdown-item"
                  [class.active]="activeItem === child.label"
                  (click)="onChildClick(child, $event)">
                <div class="dropdown-link">
                  <i class="icon">{{ child.icon }}</i>
                  <span class="nav-text">{{ child.label }}</span>
                </div>
              </li>
            </ul>
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
      position: relative;
    }

    .nav-link.has-children {
      justify-content: space-between;
    }

    .nav-link.active {
      background: rgba(255, 255, 255, 0.2);
      border-right: 4px solid white;
    }

    .dropdown-icon {
      font-size: 12px;
      transition: transform 0.3s ease;
      margin-left: auto;
    }

    .dropdown-icon.expanded {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      list-style: none;
      margin: 0;
      padding: 0;
      background: rgba(0, 0, 0, 0.1);
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
      }
      to {
        opacity: 1;
        max-height: 200px;
      }
    }

    .dropdown-item {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dropdown-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .dropdown-item.active {
      background: rgba(255, 255, 255, 0.15);
    }

    .dropdown-link {
      display: flex;
      align-items: center;
      padding: 12px 20px 12px 50px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
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
    { 
      label: 'Financials', 
      icon: '💰', 
      action: 'financials',
      isExpanded: false,
      children: [
        { label: 'Invoice', icon: '📄', action: 'invoice' },
        { label: 'Payment and Aging', icon: '⏰', action: 'payment-aging' },
        { label: 'Credit and Debit Memo', icon: '📝', action: 'credit-debit-memo' }
      ]
    }
  ];

  constructor(private router: Router) {}

  onItemClick(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      // Toggle dropdown for items with children
      item.isExpanded = !item.isExpanded;
      
      // Close other dropdowns
      this.menuItems.forEach(menuItem => {
        if (menuItem !== item && menuItem.children) {
          menuItem.isExpanded = false;
        }
      });
    } else {
      // Handle regular menu items
      this.activeItem = item.label;
      if (item.action) {
        this.menuItemSelected.emit(item.action);
      }
      
      // Close all dropdowns when selecting a non-dropdown item
      this.menuItems.forEach(menuItem => {
        if (menuItem.children) {
          menuItem.isExpanded = false;
        }
      });
    }
  }

  onChildClick(child: MenuItem, event: Event): void {
    event.stopPropagation(); // Prevent parent click
    this.activeItem = child.label;
    if (child.action) {
      this.menuItemSelected.emit(child.action);
    }
  }
}
