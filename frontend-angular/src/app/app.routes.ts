import { Routes } from '@angular/router';
import { LoginComponent } from './login';
import { SimpleDashboardComponent } from './simple-dashboard/simple-dashboard.component';
import { CreditDebitMemoComponent } from './credit-debit-memo/credit-debit-memo.component';
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
  { path: '**', redirectTo: '/login' }
];
