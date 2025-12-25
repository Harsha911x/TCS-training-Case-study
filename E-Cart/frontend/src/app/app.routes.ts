import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/public/landing/landing-page.component';
import { RegisterComponent } from './features/public/register/register.component';
import { LoginComponent } from './features/public/login/login.component';
import { AdminLoginComponent } from './features/admin/admin-login/admin-login.component';
import { CustomerHomeComponent } from './features/customer/customer-home/customer-home.component';
import { CartComponent } from './features/customer/cart/cart.component';
import { OrdersComponent } from './features/customer/orders/orders.component';
import { ProfileComponent } from './features/customer/profile/profile.component';
import { PaymentComponent } from './features/customer/payment/payment.component';
import { AddProductComponent } from './features/admin/add-product/add-product.component';
import { AllProductsComponent } from './features/admin/all-products/all-products.component';
import { AllCustomersComponent } from './features/admin/all-customers/all-customers.component';
import { AllOrdersComponent } from './features/admin/all-orders/all-orders.component';
import { FeedbackComponent } from './features/admin/feedback/feedback.component';
import { BulkUploadComponent } from './features/admin/bulk-upload/bulk-upload.component';
import { customerGuard } from './core/guards/customer.guard';
import { adminGuard } from './core/guards/admin.guard';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { AnalyticsComponent } from './features/admin/analytics/analytics.component';
import { CancelOrderComponent } from './features/customer/cancel-order/cancel-order.component';
import { CustomerFeedbackComponent } from './features/customer/feedback/feedback.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'customer/home', component: CustomerHomeComponent, canActivate: [customerGuard] },
  { path: 'customer/cart', component: CartComponent, canActivate: [customerGuard] },
  { path: 'customer/orders', component: OrdersComponent, canActivate: [customerGuard] },
  { path: 'customer/orders/cancel', component: CancelOrderComponent, canActivate: [customerGuard] },
  { path: 'customer/feedback/:orderId', component: CustomerFeedbackComponent, canActivate: [customerGuard] },
  { path: 'customer/profile', component: ProfileComponent, canActivate: [customerGuard] },
  { path: 'customer/payment', component: PaymentComponent, canActivate: [customerGuard] },
  { path: 'admin/home', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products/new', component: AddProductComponent, canActivate: [adminGuard] },
  { path: 'admin/products/all', component: AllProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/products/bulk-upload', component: BulkUploadComponent, canActivate: [adminGuard] },
  { path: 'admin/customers', component: AllCustomersComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AllOrdersComponent, canActivate: [adminGuard] },
  { path: 'admin/feedback', component: FeedbackComponent, canActivate: [adminGuard] },
  { path: 'admin/analytics', component: AnalyticsComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];

