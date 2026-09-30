import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
export interface Product {
  id?: string; _id?: string; name: string; category: string;
  price: number; originalPrice?: number; description: string;
  image: string; images?: string[]; sizes: string[]; colours: any;
  material: string; type: string;
  status: 'instock'|'outofstock'|'limited'|'comingsoon';
  badge?: string; published?: boolean; isLive: boolean; launchDate?: string;
  launchDescription?: string; quantity: number; selectedSize: string; createdAt?: any;
}
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}
  getAll(): Observable<Product[]> { return this.api.getProducts(); }
  add(data: Partial<Product>): Observable<Product> { return this.api.addProduct(data); }
  update(id: string, data: Partial<Product>): Observable<Product> { return this.api.updateProduct(id, data); }
  delete(id: string): Observable<any> { return this.api.deleteProduct(id); }
}