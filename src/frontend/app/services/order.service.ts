import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id?: string;
  customerName: string;
  customerEmail: string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate?: Date;
}

export interface CartCheckoutRequest {
  customerName: string;
  customerEmail: string;
  cartItems: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.apiUrl = `${this.config.getApiUrl()}/api/orders`;
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: Omit<Order, '_id' | 'orderDate'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  checkoutCart(customerName: string, customerEmail: string, cartItems: any[]): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    const payload: CartCheckoutRequest = {
      customerName,
      customerEmail,
      cartItems
    };
    return this.http.post<any>(`${this.apiUrl}/checkout`, payload, { headers });
  }
}
