import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsData } from '../models/analytics.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAnalytics(period: string = 'MONTH'): Observable<AnalyticsData> {
    const params = new HttpParams().set('period', period);
    return this.http.get<AnalyticsData>(`${this.apiUrl}/admin/analytics`, { params });
  }
}

