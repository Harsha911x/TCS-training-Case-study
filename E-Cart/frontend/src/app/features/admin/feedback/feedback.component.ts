import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProductCategory } from '../../../core/models/product.model';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar [role]="'admin'" [userName]="adminName" (signOut)="signOut()"></app-navbar>
      <div class="content">
        <div class="container">
          <h1>Customer Feedback</h1>

          <div class="filters-section">
            <div class="filters-row">
              <input class="input" placeholder="Product ID" [(ngModel)]="productId" (keyup.enter)="load()">
              <select class="input" [(ngModel)]="category" (change)="load()">
                <option value="">All Categories</option>
                <option *ngFor="let cat of categories" [value]="cat">{{cat}}</option>
              </select>
              <button class="btn primary" (click)="load()">Search</button>
              <button class="btn" (click)="clearFilters()">Clear</button>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of feedbacks">
                  <td>{{f.orderId}}</td>
                  <td>
                    <div class="customer-info">
                      <div class="customer-name">{{f.customerName}}</div>
                      <div class="customer-id">{{f.customerId}}</div>
                    </div>
                  </td>
                  <td>{{f.productId}}</td>
                  <td>{{f.productName}}</td>
                  <td>{{f.productCategory}}</td>
                  <td>
                    <div class="rating-display">
                      <span class="stars">{{getStars(f.rating)}}</span>
                      <span class="rating-value">({{f.rating}}/5)</span>
                    </div>
                  </td>
                  <td class="review-cell">
                    <div class="review-text" [title]="f.description || 'No description'">
                      {{f.description || '-'}}
                    </div>
                  </td>
                  <td>{{f.createdAt | date:'short'}}</td>
                </tr>
                <tr *ngIf="feedbacks.length === 0">
                  <td colspan="8" class="empty">No feedback found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page{min-height:100vh;background:#EAEDED}
    .content{padding:20px}
    .container{max-width:1400px;margin:0 auto}
    h1{font-size:24px;font-weight:500;margin-bottom:16px;color:#111}
    .filters-section{background:#fff;padding:16px;border-radius:8px;margin-bottom:16px}
    .filters-row{display:flex;gap:10px;align-items:center}
    .input{padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:14px}
    .input:focus{outline:none;border-color:#FF9900}
    .btn{padding:8px 16px;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer;font-size:14px}
    .btn.primary{background:#FF9900;border-color:#FF9900;color:#fff}
    .btn.primary:hover{background:#FFB84D}
    .btn:hover{background:#f5f5f5}
    .table-wrap{background:#fff;border-radius:8px;overflow:auto;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
    table{width:100%;border-collapse:collapse}
    th,td{padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:left}
    thead th{background:#fafafa;font-weight:600;color:#111}
    .customer-info{display:flex;flex-direction:column;gap:2px}
    .customer-name{font-weight:500;color:#111}
    .customer-id{font-size:12px;color:#767676}
    .rating-display{display:flex;align-items:center;gap:6px}
    .stars{color:#FF9900;font-size:14px}
    .rating-value{font-size:12px;color:#767676}
    .review-cell{max-width:300px}
    .review-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#555}
    .empty{text-align:center;color:#666;padding:20px}
  `]
})
export class FeedbackComponent implements OnInit {
  feedbacks: any[] = [];
  productId = '';
  category = '';
  adminName = '';
  categories = Object.values(ProductCategory);

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    this.adminName = currentUser?.username || currentUser?.customerName || 'Admin';
    this.load();
  }

  load() {
    let params = new HttpParams();
    if (this.productId) params = params.set('productId', this.productId);
    if (this.category) params = params.set('category', this.category);

    this.http.get<any[]>('http://localhost:8080/api/admin/feedback', { params }).subscribe({
      next: (res) => { this.feedbacks = res || []; },
      error: () => { this.feedbacks = []; }
    });
  }

  clearFilters() {
    this.productId = '';
    this.category = '';
    this.load();
  }

  getStars(rating: number): string {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  signOut() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
