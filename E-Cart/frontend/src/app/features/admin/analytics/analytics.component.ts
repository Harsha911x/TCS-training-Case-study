import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AnalyticsData } from '../../../core/models/analytics.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  adminName = '';
  analytics: AnalyticsData | null = null;
  isLoading = false;
  selectedPeriod = 'MONTH';
  periods = [
    { value: 'DAY', label: 'Today' },
    { value: 'WEEK', label: 'Last Week' },
    { value: 'MONTH', label: 'Last Month' },
    { value: 'YEAR', label: 'Last Year' }
  ];

  constructor(
    private auth: AuthService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    this.adminName = currentUser?.username || currentUser?.customerName || 'Admin';
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.analyticsService.getAnalytics(this.selectedPeriod).subscribe({
      next: (data) => {
        this.analytics = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading analytics:', err);
        this.isLoading = false;
      }
    });
  }

  onPeriodChange(): void {
    this.loadAnalytics();
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '₹0';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('en-IN');
  }

  formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(2)}%`;
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return '#6c757d';
    const colors: { [key: string]: string } = {
      'CONFIRMED': '#007bff',
      'IN_TRANSIT': '#ffc107',
      'DELIVERED': '#28a745',
      'CANCELLED': '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  hasLowStockProducts(): boolean {
    const products = this.analytics?.products?.lowStockProducts;
    return !!(products && products.length > 0);
  }

  hasCancellationReasons(): boolean {
    const reasons = this.analytics?.returns?.reasonsDistribution;
    return !!(reasons && Object.keys(reasons).length > 0);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}

