import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="header">
        <h1>Admin Panel</h1>
        <div class="nav">
          <a routerLink="/admin/home">Home</a>
          <a routerLink="/admin/products/new">Add Products</a>
          <a routerLink="/admin/products/update">Update Products</a>
          <a routerLink="/admin/products/all">View All Products</a>
          <a routerLink="/admin/customers">View All Customers</a>
          <a routerLink="/admin/orders">View All Orders</a>
          <a routerLink="/admin/feedback">Feedback</a>
          <span>Welcome {{username}}</span>
          <button (click)="logout()" class="btn">Logout</button>
        </div>
      </div>
      <h2>Admin Dashboard</h2>
    </div>
  `
})
export class AdminHomeComponent {
  username = '';

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getCurrentUser();
    this.username = user?.username || '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}

