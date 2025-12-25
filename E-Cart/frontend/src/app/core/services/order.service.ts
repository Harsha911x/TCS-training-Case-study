import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderStatus } from '../models/order.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getOrders(status?: OrderStatus, dateFrom?: string, dateTo?: string, page = 0, size = 10, sort = 'createdAt,desc'): Observable<Page<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (status) params = params.set('status', status);
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);

    return this.http.get<Page<Order>>(`${this.apiUrl}/customers/me/orders`, { params });
  }

  updateOrder(orderId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/orders/${orderId}`, { orderStatus: status });
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/customers/me/orders/${orderId}`);
  }

  cancelOrder(orderId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers/me/orders/${orderId}/cancel`, { reason });
  }

  submitFeedback(orderId: string, productId: string, rating: number, description: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers/me/feedback`, {
      orderId,
      productId,
      rating,
      description
    });
  }

  downloadInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/customers/me/invoices/${orderId}/download`, { responseType: 'blob' });
  }
}

