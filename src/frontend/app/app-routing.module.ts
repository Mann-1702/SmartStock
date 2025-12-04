import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomerShopComponent } from './pages/customer-shop/customer-shop.component';
import { CartComponent } from './pages/cart/cart.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { AuthGuard } from './guards/auth.guard';
import { PaymentComponent } from './pages/payment/payment.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },  // Guard removed for testing
  { path: 'products', component: ProductsComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'customer-shop', component: CustomerShopComponent },
  { path: 'cart', component: CartComponent },
  { path: 'pricing', component: PricingComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
