import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-all-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar [role]="'admin'" [userName]="adminName" (signOut)="signOut()"></app-navbar>
      <div class="content">
        <div class="container">
          <h1>Orders</h1>

          <div class="filters">
            <select class="input" [(ngModel)]="status" (change)="search()">
              <option value="">All Status</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button class="btn" (click)="search()">Apply</button>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Created At</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of rows">
                  <td>{{o.orderId}}</td>
                  <td>{{o.customerName || o.customer?.name}}</td>
                  <td>
                    <select [(ngModel)]="o.status" (change)="changeOrderStatus(o)" id="orderStatus">
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="IN_TRANSIT">IN_TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>{{'₹' + o.totalAmount}}</td>
                  <td>{{o.createdAt | date:'medium'}}</td>
                  <td>{{o.paymentMode || '-'}}</td>
                </tr>
                <tr *ngIf="rows.length===0"><td colspan="6" class="empty">No orders found</td></tr>
              </tbody>
            </table>
          </div>

          <div class="pager" *ngIf="totalPages>1">
            <button class="btn" [disabled]="page===0" (click)="prev()">← Prev</button>
            <span>Page {{page+1}} of {{totalPages}}</span>
            <button class="btn" [disabled]="page>=totalPages-1" (click)="next()">Next →</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page{min-height:100vh;background:#EAEDED}
    .content{padding:20px}
    .container{max-width:1400px;margin:0 auto}
    .filters{display:flex;gap:10px;align-items:center;background:#fff;padding:12px;border-radius:8px;margin:10px 0}
    .input{padding:8px 10px;border:1px solid #ddd;border-radius:4px}
    .btn{padding:8px 12px;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer}
    .table-wrap{background:#fff;border-radius:8px;overflow:auto}
    table{width:100%;border-collapse:collapse}
    th,td{padding:10px;border-bottom:1px solid #eee;font-size:14px;text-align:left}
    thead th{background:#fafafa}
    .pager{display:flex;gap:12px;align-items:center;justify-content:center;margin-top:12px}
    .empty{text-align:center;color:#666}
  `]
})
export class AllOrdersComponent implements OnInit {
  rows: any[] = [];
  page = 0;
  size = 10;
  totalPages = 0;
  status = '';
  adminName = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {
    this.status = this.route.snapshot.queryParamMap.get("status") || "";
    console.log(this.status);
  }

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    this.adminName = currentUser?.username || currentUser?.customerName || 'Admin';
    this.load();
  }

  private buildParams(): HttpParams {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());
    if (this.status) params = params.set('status', this.status);
    return params;
  }

  load(){
    this.http.get<any>('http://localhost:8080/api/admin/orders', { params: this.buildParams() }).subscribe({
      next: (res) => { this.rows = res.content || []; this.totalPages = res.totalPages || 0; },
      error: () => { this.rows = []; this.totalPages = 0; }
    });
  }

  changeOrderStatus(order : Order) {
    this.http.put(`http://localhost:8080/api/admin/orders/${order.orderId}`, { orderStatus: order.status }).subscribe({
      next: (response) => {
        alert(`Status of ${order.orderId} changed successfully!`);
      },
      error: (err) => {
        console.log(err);
        alert(`Failed to update Order ${order.orderId}. ${err.error.message}`);
      }
    });
  }

  search(){ this.page = 0; this.load(); }
  prev(){ if(this.page>0){ this.page--; this.load(); } }
  next(){ if(this.page < this.totalPages-1){ this.page++; this.load(); } }

  signOut(){
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}

