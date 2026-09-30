import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
export interface Order {
  firstName: string; lastName: string; email: string; phone?: string;
  address?: string; suburb?: string; city?: string; province?: string;
  postalCode?: string; notes?: string; items: any[];
  subtotal: number; deliveryFee: number; discount: number; total: number;
  promoCode?: string; paymentMethod: PaymentMethod; paymentStatus?: string; status?: string;
}
export type PaymentMethod = 'payfast' | 'cod';
@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}
  place(order: any): Observable<any> { return this.api.placeOrder(order); }
  getAll(): Observable<any[]> { return this.api.getOrders(); }
  updateStatus(id: string, status: string): Observable<any> { return this.api.updateOrderStatus(id, status); }
}
