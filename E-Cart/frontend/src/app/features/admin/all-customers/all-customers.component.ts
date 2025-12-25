import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-all-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar [role]="'admin'" [userName]="adminName" (signOut)="signOut()"></app-navbar>
      <div class="content">
        <div class="container">
          <h1>Customers</h1>

          <div class="filters-section">
            <div class="filters-row">
              <input class="input" placeholder="Customer ID" [(ngModel)]="customerId" (keyup.enter)="search()">
              <input class="input" placeholder="Name" [(ngModel)]="name" (keyup.enter)="search()">
              <input class="input" placeholder="Email" [(ngModel)]="email" (keyup.enter)="search()">
            </div>
            <div class="filters-row">
              <input type="date" class="input" placeholder="Registration From" [(ngModel)]="dateFrom">
              <input type="date" class="input" placeholder="Registration To" [(ngModel)]="dateTo">
              <button class="btn primary" (click)="search()">Search</button>
              <button class="btn" (click)="clearFilters()">Clear</button>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Country</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of rows">
                  <td>{{c.customerId}}</td>
                  <td>{{c.name}}</td>
                  <td>{{c.email}}</td>
                  <td>{{c.phoneNumber}}</td>
                  <td><span [class]="'status-badge ' + (c.status === 'ACTIVE' ? 'active' : 'inactive')">{{c.status}}</span></td>
                  <td>{{c.country}}</td>
                  <td>{{c.createdAt | date:'shortDate'}}</td>
                  <td>
                    <button class="link danger" (click)="deleteCustomer(c.customerId)">Delete</button>
                  </td>
                </tr>
                <tr *ngIf="rows.length===0"><td colspan="8" class="empty">No customers found</td></tr>
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
    .filters-section{background:#fff;padding:16px;border-radius:8px;margin:16px 0}
    .filters-row{display:flex;gap:10px;align-items:center;margin-bottom:10px}
    .filters-row:last-child{margin-bottom:0}
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
    .status-badge{padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500}
    .status-badge.active{background:#d4edda;color:#155724}
    .status-badge.inactive{background:#f8d7da;color:#721c24}
    .link{background:none;border:none;color:#0066c0;text-decoration:underline;cursor:pointer;font-size:14px}
    .link.danger{color:#c40000}
    .link.danger:hover{color:#8b0000}
    .pager{display:flex;gap:12px;align-items:center;justify-content:center;margin-top:16px}
    .empty{text-align:center;color:#666;padding:20px}
  `]
})
export class AllCustomersComponent implements OnInit {
  rows: any[] = [];
  page = 0;
  size = 10;
  totalPages = 0;
  customerId = '';
  name = '';
  email = '';
  dateFrom = '';
  dateTo = '';
  adminName = '';

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

  private buildParams(): HttpParams {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());

    if (this.customerId) {
      params = params.set('id', this.customerId);
    }
    if (this.name) {
      params = params.set('name', this.name);
    }
    if (this.email) {
      params = params.set('email', this.email);
    }
    if (this.dateFrom) {
      params = params.set('dateFrom', this.dateFrom);
    }
    if (this.dateTo) {
      params = params.set('dateTo', this.dateTo);
    }
    return params;
  }

  load(){
    this.http.get<any>('http://localhost:8080/api/admin/customers', { params: this.buildParams() }).subscribe({
      next: (res) => { this.rows = res.content || []; this.totalPages = res.totalPages || 0; },
      error: () => { this.rows = []; this.totalPages = 0; }
    });
  }

  search(){ this.page = 0; this.load(); }
  
  clearFilters(){
    this.customerId = '';
    this.name = '';
    this.email = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.page = 0;
    this.load();
  }

  prev(){ if(this.page>0){ this.page--; this.load(); } }
  next(){ if(this.page < this.totalPages-1){ this.page++; this.load(); } }

  deleteCustomer(customerId: string){
    if(confirm(`Are you sure you want to delete customer ${customerId}? This will mark them as inactive.`)){
      this.http.delete(`http://localhost:8080/api/admin/customers/${customerId}`).subscribe({
        next: () => {
          alert('Customer deleted successfully');
          this.load();
        },
        error: (err) => alert(err.error?.message || 'Error deleting customer')
      });
    }
  }

  signOut(){
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}

