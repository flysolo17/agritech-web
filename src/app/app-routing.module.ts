import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './views/auth/login/login.component';
import { AdminMainComponent } from './views/admin/admin-main/admin-main.component';
import { StaffMainComponent } from './views/staff/staff-main/staff-main.component';
import { SignupComponent } from './views/auth/signup/signup.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { DashboardComponent } from './views/admin/dashboard/dashboard.component';

import { ProductComponent } from './views/inventory/product/product.component';
import { ReportsComponent } from './views/admin/reports/reports.component';
import { CustomerComponent } from './views/admin/customer/customer.component';
import { OrdersComponent } from './views/admin/orders/orders.component';
import { UsersComponent } from './views/admin/user/users/users.component';
import { AuditComponent } from './views/admin/audit/audit.component';
import { ContentsComponent } from './views/admin/contents/contents.component';
import { AddProductComponent } from './views/inventory/add-product/add-product.component';

const routes: Routes = [
  { path: ' ', redirectTo: 'login', pathMatch: 'full' },
  { path: 'notfound', component: NotFoundComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'admin',
    component: AdminMainComponent,
    children: [
      { path: '', component: DashboardComponent },

      { path: 'dashboard', component: DashboardComponent },
      { path: 'inventory', component: ProductComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'customer', component: CustomerComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'users', component: UsersComponent },
      { path: 'audit', component: AuditComponent },
      { path: 'contents', component: ContentsComponent },
      { path: 'add-product', component: AddProductComponent },
    ],
  },

  { path: 'staff', component: StaffMainComponent },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
