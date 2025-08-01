import { Routes } from '@angular/router';
import { LoginComponent } from './login';
import { SimpleDashboardComponent } from './simple-dashboard/simple-dashboard.component';
import { CreditDebitMemoComponent } from './credit-debit-memo/credit-debit-memo.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { GoodsReceiptComponent } from './goods-receipt/goods-receipt.component';
import { RFQComponent } from './rfq/rfq.component';
import { AuthGuard, LoginGuard } from './guards';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  { 
    path: 'dashboard', 
    component: SimpleDashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'credit-debit-memo', 
    component: CreditDebitMemoComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'invoice', 
    component: InvoiceComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'purchase-order', 
    component: PurchaseOrderComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'goods-receipt', 
    component: GoodsReceiptComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'rfq', 
    component: RFQComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
