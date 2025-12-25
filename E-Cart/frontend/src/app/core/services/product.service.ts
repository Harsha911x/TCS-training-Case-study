import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCategory, ProductHighlights } from '../models/product.model';
import { Page } from '../models/page.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getProducts(productId?: string, name?: string, category?: ProductCategory, page = 0, size = 10, sort = 'name,asc'): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (productId) params = params.set('productId', productId);
    if (name) params = params.set('name', name);
    if (category) params = params.set('category', category);

    return this.http.get<Page<Product>>(`${this.apiUrl}/products`, { params });
  }

  getProduct(productId: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${productId}`);
  }

  getLandingHighlights(heroLimit = 5, sectionLimit = 8): Observable<ProductHighlights> {
    const params = new HttpParams()
      .set('heroLimit', heroLimit.toString())
      .set('sectionLimit', sectionLimit.toString());

    return this.http.get<ProductHighlights>(`${this.apiUrl}/products/landing/highlights`, { params });
  }

  getCustomerHighlights(heroLimit = 4, sectionLimit = 6): Observable<ProductHighlights> {
    const params = new HttpParams()
      .set('heroLimit', heroLimit.toString())
      .set('sectionLimit', sectionLimit.toString());

    return this.http.get<ProductHighlights>(`${this.apiUrl}/products/customer/highlights`, { params });
  }
}

