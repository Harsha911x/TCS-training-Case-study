import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  category: string;
  description?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  addToCart(productId: string, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers/me/cart/add`, { productId, quantity })
      .pipe(tap(() => this.refreshCart()));
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/customers/me/cart`)
      .pipe(tap(cart => this.cartSubject.next(cart)));
  }

  updateCartItem(productId: string, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/me/cart/update`, { productId, quantity })
      .pipe(tap(() => this.refreshCart()));
  }

  removeFromCart(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/me/cart/remove/${productId}`)
      .pipe(tap(() => this.refreshCart()));
  }

  checkout(addressSnapshot: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers/me/cart/checkout`, { addressSnapshot });
  }

  private refreshCart(): void {
    this.getCart().subscribe();
  }
}

