import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

@Component({
	selector: 'app-admin-dashboard',
	standalone: true,
	imports: [CommonModule, RouterLink, NavbarComponent],
	template: `
		<div class="admin-page">
			<app-navbar [role]="'admin'" [userName]="adminName" (signOut)="logout()"></app-navbar>

			<div class="content">
				<div class="container">
					<h1 class="title">Admin Dashboard</h1>

					<div class="stats-grid">
						<div class="stat-card">
							<div class="icon">🧰</div>
							<div class="value">{{productsCount}}</div>
							<div class="label">Products</div>
							<a routerLink="/admin/products/all" class="link">Manage Products →</a>
						</div>
						<div class="stat-card">
							<div class="icon">👥</div>
							<div class="value">{{customersCount}}</div>
							<div class="label">Customers</div>
							<a routerLink="/admin/customers" class="link">View Customers →</a>
						</div>
						<div class="stat-card">
							<div class="icon">🧾</div>
							<div class="value">{{ordersCount}}</div>
							<div class="label">Orders</div>
							<a routerLink="/admin/orders" class="link">View Orders →</a>
						</div>
						<div class="stat-card">
							<div class="icon">✅</div>
							<div class="value">{{deliveredCount}}</div>
							<div class="label">Delivered</div>
							<a (click)="goToDeliveredOrders()" class="link">Delivered Orders →</a>
						</div>
					</div>

					<div class="actions">
						<a routerLink="/admin/products/new" class="btn primary">＋ Add Product</a>
						<a routerLink="/admin/products/bulk-upload" class="btn">⇪ Bulk Upload</a>
						<a routerLink="/admin/analytics" class="btn">📊 Analytics</a>
					</div>
				</div>
			</div>
		</div>
	`,
	styles: [`
		.admin-page { min-height:100vh; background:#EAEDED; }
		.content { padding:24px; }
		.container { max-width:1400px; margin:0 auto; }
		.title { color:#111; font-weight:500; margin-bottom:16px; }
		.stats-grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap:16px; }
		.stat-card { background:#fff; border-radius:8px; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:6px; }
		.icon { font-size:28px; }
		.value { font-size:28px; font-weight:700; color:#111; }
		.label { color:#666; font-size:12px; text-transform:uppercase; letter-spacing:.5px; }
		.link { color:#0066c0; text-decoration:none; font-size:13px; margin-top:8px; }
		.link:hover { text-decoration:underline; cursor: pointer; }
		.actions { display:flex; gap:10px; margin-top:20px; }
		.btn { padding:10px 16px; background:#fff; border:1px solid #ddd; border-radius:4px; text-decoration:none; color:#111; }
		.btn.primary { background:#FF9900; border-color:#FF9900; color:#fff; }
		.btn.primary:hover { background:#FFB84D; }
	`]
})
export class AdminDashboardComponent implements OnInit {
	adminName = '';
	productsCount = 0;
	customersCount = 0;
	ordersCount = 0;
	deliveredCount = 0;

	private readonly apiBase = 'http://localhost:8080/api/admin';
	private readonly jsonHeaders = new HttpHeaders({ 'Accept': 'application/json' });

	constructor(
		private auth: AuthService,
		private http: HttpClient,
		private route: Router,
	) {}

	ngOnInit(): void {
		const currentUser = this.auth.getCurrentUser();
		this.adminName = currentUser?.username || currentUser?.customerName || 'Admin';
		this.loadStats();
	}

	loadStats() {
		const params = new HttpParams().set('page','0').set('size','1');
		this.http.get<any>(`${this.apiBase}/products`, { params, headers: this.jsonHeaders, observe: 'body', responseType: 'json' as const })
			.subscribe({ next: r => this.productsCount = r?.totalElements || 0, error: () => this.productsCount = 0 });
		this.http.get<any>(`${this.apiBase}/customers`, { params, headers: this.jsonHeaders, observe: 'body', responseType: 'json' as const })
			.subscribe({ next: r => this.customersCount = r?.totalElements || 0, error: () => this.customersCount = 0 });
		this.http.get<any>(`${this.apiBase}/orders`, { params, headers: this.jsonHeaders, observe: 'body', responseType: 'json' as const })
			.subscribe({ next: r => this.ordersCount = r?.totalElements || 0, error: () => this.ordersCount = 0 });
		this.http.get<any>(`${this.apiBase}/orders`, { params: params.set('status','DELIVERED'), headers: this.jsonHeaders, observe: 'body', responseType: 'json' as const })
			.subscribe({ next: r => this.deliveredCount = r?.totalElements || 0, error: () => this.deliveredCount = 0 });
	}

	goToDeliveredOrders() {
		this.route.navigate(['/admin/orders'], { queryParams: { 'status': 'DELIVERED' } });
	}

	logout() { 
		this.auth.logout();
		this.route.navigate(['/admin/login']);
	 }
}
