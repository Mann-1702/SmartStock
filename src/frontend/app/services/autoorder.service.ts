import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AutoOrder {
  _id?: string;
  productId: string;
  productName: string;
  orderedQuantity: number;
  currentStock: number;
  threshold: number;
  orderDate?: Date;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  vendorOrderId?: string;
  notes?: string;
}

export interface AutoOrderStats {
  total: number;
  pending: number;
  ordered: number;
  received: number;
  cancelled: number;
  totalQuantityOrdered: number;
}

@Injectable({
  providedIn: 'root'
})
export class AutoOrderService {
  private apiUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.apiUrl = `${this.config.getApiUrl()}/api/autoorders`;
  }

  getAutoOrders(): Observable<AutoOrder[]> {
    return this.http.get<AutoOrder[]>(this.apiUrl);
  }

  getAutoOrdersByStatus(status: string): Observable<AutoOrder[]> {
    return this.http.get<AutoOrder[]>(`${this.apiUrl}/status/${status}`);
  }

  getAutoOrder(id: string): Observable<AutoOrder> {
    return this.http.get<AutoOrder>(`${this.apiUrl}/${id}`);
  }

  createAutoOrder(autoOrder: Omit<AutoOrder, '_id' | 'orderDate'>): Observable<AutoOrder> {
    return this.http.post<AutoOrder>(this.apiUrl, autoOrder);
  }

  updateAutoOrderStatus(
    id: string, 
    status: string, 
    vendorOrderId?: string, 
    notes?: string
  ): Observable<AutoOrder> {
    return this.http.put<AutoOrder>(`${this.apiUrl}/${id}/status`, {
      status,
      vendorOrderId,
      notes
    });
  }

  getAutoOrderStats(): Observable<AutoOrderStats> {
    return this.http.get<AutoOrderStats>(`${this.apiUrl}/stats/summary`);
  }

  deleteAutoOrder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
