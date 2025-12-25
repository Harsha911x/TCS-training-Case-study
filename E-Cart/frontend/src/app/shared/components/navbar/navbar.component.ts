import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [CommonModule, RouterLink],
	template: `
		<div class="nav">
			<div class="nav-content">
				<a [routerLink]="role === 'admin' ? '/admin/home' : '/customer/home'" class="logo">E-Cart</a>
				<div *ngIf="role === 'customer'" class="search">
					<ng-content select="[search]"></ng-content>
				</div>
				<div class="links">
					<a *ngIf="role==='customer'" routerLink="/customer/home" class="link" routerLinkActive="active"><span>🏠</span><span>Home</span></a>
					<a *ngIf="role==='customer'" routerLink="/customer/cart" class="link cart" routerLinkActive="active">
						<span>🛒</span><span>Cart</span>
						<span *ngIf="cartCount && cartCount>0" class="badge">{{cartCount}}</span>
					</a>
					<a *ngIf="role==='customer'" routerLink="/customer/orders" class="link" routerLinkActive="active"><span>📦</span><span>Orders</span></a>

					<a *ngIf="role==='admin'" routerLink="/admin/home" class="link" routerLinkActive="active"><span>📊</span><span>Dashboard</span></a>
					<a *ngIf="role==='admin'" routerLink="/admin/products/all" class="link" routerLinkActive="active"><span>🧰</span><span>Products</span></a>
					<a *ngIf="role==='admin'" routerLink="/admin/customers" class="link" routerLinkActive="active"><span>👥</span><span>Customers</span></a>
					<a *ngIf="role==='admin'" routerLink="/admin/orders" class="link" routerLinkActive="active"><span>🧾</span><span>Orders</span></a>
					<a *ngIf="role==='admin'" routerLink="/admin/feedback" class="link" routerLinkActive="active"><span>💬</span><span>Feedback</span></a>
				</div>
				<div class="user" *ngIf="role === 'customer'">
					<div class="profile-dropdown" #dropdown>
						<div class="profile-trigger" (click)="toggleDropdown($event)">
							<span class="profile-icon">👤</span>
							<span class="user-name">{{userName || 'Guest'}}</span>
							<span class="dropdown-arrow">▼</span>
						</div>
						<div class="dropdown-menu" [class.show]="showDropdown" (click)="$event.stopPropagation()">
							<a routerLink="/customer/profile" class="dropdown-item" (click)="closeDropdown()">
								<span>⚙️</span>
								<span>Update Profile</span>
							</a>
							<button class="dropdown-item logout-item" (click)="handleLogout()">
								<span>🚪</span>
								<span>Logout</span>
							</button>
						</div>
					</div>
				</div>
				<div class="user" *ngIf="role === 'admin'">
					<span class="hello">Hello, {{userName || 'Admin'}}</span>
					<button class="signout" (click)="signOut.emit()">Sign Out</button>
				</div>
			</div>
		</div>
	`,
	styles: [`
		.nav { background:#131921; color:#fff; padding:12px 0; position:sticky; top:0; z-index:100; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
		.nav-content { max-width:1400px; margin:0 auto; padding:0 24px; display:flex; align-items:center; gap:20px; }
		.logo { color:#FF9900; text-decoration:none; font-weight:700; font-size:24px; white-space:nowrap; transition: all 0.3s ease; letter-spacing:0.5px; }
		.logo:hover { color:#FFB84D; text-shadow: 0 0 10px rgba(255, 153, 0, 0.5), 0 0 20px rgba(255, 153, 0, 0.3); }
		.search { flex:1; max-width:700px; margin:0 20px; }
		.links { display:flex; gap:16px; align-items:center; }
		.link { color:#fff; text-decoration:none; font-size:14px; padding:10px 14px; border-radius:4px; display:flex; gap:8px; align-items:center; transition: all 0.3s ease; position: relative; font-weight:500; }
		.link:hover { background:rgba(255,255,255,0.12); box-shadow: 0 0 15px rgba(255, 153, 0, 0.4), inset 0 0 10px rgba(255, 153, 0, 0.1); transform: translateY(-2px); }
		.link.active { background:rgba(255, 153, 0, 0.2); box-shadow: 0 0 20px rgba(255, 153, 0, 0.5), inset 0 0 15px rgba(255, 153, 0, 0.15); }
		.cart { position:relative; }
		.badge { background:#FF9900; color:#111; border-radius:12px; font-size:11px; padding:2px 7px; position:absolute; top:-8px; right:-10px; font-weight:700; box-shadow: 0 2px 4px rgba(0,0,0,0.2); min-width:20px; text-align:center; }
		.user { margin-left:auto; display:flex; align-items:center; gap:12px; }
		.hello { color:#ddd; font-size:13px; font-weight:500; }
		.signout { background:#f0c14b; border:1px solid #a88734; color:#111; padding:8px 16px; border-radius:4px; cursor:pointer; font-size:13px; font-weight:600; transition: all 0.3s ease; }
		.signout:hover { background:#f4d078; box-shadow: 0 0 15px rgba(240, 193, 75, 0.6); transform: translateY(-2px); }
		
		.profile-dropdown { position: relative; cursor: pointer; }
		.profile-trigger { display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-radius: 4px; transition: all 0.3s ease; }
		.profile-trigger:hover { background: rgba(255,255,255,0.1); box-shadow: 0 0 15px rgba(255, 153, 0, 0.4), inset 0 0 10px rgba(255, 153, 0, 0.1); }
		.profile-icon { font-size: 20px; }
		.user-name { font-size: 14px; font-weight: 600; color: #fff; }
		.dropdown-arrow { font-size: 10px; transition: transform 0.3s ease; }
		.profile-dropdown.show .dropdown-arrow { transform: rotate(180deg); }
		
		.dropdown-menu { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); min-width: 200px; margin-top: 5px; opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.3s ease; z-index: 1000; overflow: hidden; }
		.dropdown-menu.show { opacity: 1; visibility: visible; transform: translateY(0); }
		.dropdown-item { display: flex; align-items: center; gap: 12px; padding: 14px 18px; color: #111; text-decoration: none; font-size: 14px; transition: all 0.2s ease; border: none; background: none; width: 100%; text-align: left; cursor: pointer; font-weight:500; }
		.dropdown-item:hover { background: #f5f5f5; }
		.logout-item { border-top: 1px solid #e0e0e0; color: #c40000; }
		.logout-item:hover { background: #fff4f4; }
	`]
})
export class NavbarComponent implements OnInit, OnDestroy {
	@Input() role: 'customer'|'admin' = 'customer';
	@Input() userName = '';
	@Input() cartCount = 0;
	@Output() signOut = new EventEmitter<void>();
	showDropdown = false;

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.profile-dropdown')) {
			this.closeDropdown();
		}
	}

	toggleDropdown(event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
		}
		this.showDropdown = !this.showDropdown;
	}

	closeDropdown() {
		this.showDropdown = false;
	}

	handleLogout() {
		this.closeDropdown();
		this.signOut.emit();
	}

	ngOnInit() {}
	ngOnDestroy() {}
}
