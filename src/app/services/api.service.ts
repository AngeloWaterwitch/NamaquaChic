import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export const API_BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private tokenKey = 'nc_admin_token';
  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this._isLoggedIn$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<{ token: string; email: string }> {
    return this.http.post<any>(`${API_BASE}/auth/login`, { email, password })
      .pipe(tap(res => { localStorage.setItem(this.tokenKey, res.token); this._isLoggedIn$.next(true); }));
  }
  logout(): void { localStorage.removeItem(this.tokenKey); this._isLoggedIn$.next(false); this.router.navigate(['/home']); }
  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  hasToken(): boolean { return !!localStorage.getItem(this.tokenKey); }
  private authHeaders(): HttpHeaders { return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }); }

  // Mongo returns _id, not id — normalize once here so every consumer (admin, shop grid,
  // product details, home carousel) can just rely on p.id existing.
  private withId(p: any): any { return p ? { ...p, id: p.id || p._id } : p; }

  getProducts(filters?: any): Observable<any[]> {
    const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return this.http.get<any[]>(`${API_BASE}/products${params}`)
      .pipe(map(products => products.map(p => this.withId(p))));
  }
  getProduct(id: string): Observable<any> {
    return this.http.get<any>(`${API_BASE}/products/${id}`)
      .pipe(map(p => this.withId(p)));
  }
  addProduct(data: any): Observable<any> { return this.http.post<any>(`${API_BASE}/products`, data, { headers: this.authHeaders() }).pipe(map(p => this.withId(p))); }
  updateProduct(id: string, data: any): Observable<any> { return this.http.put<any>(`${API_BASE}/products/${id}`, data, { headers: this.authHeaders() }).pipe(map(p => this.withId(p))); }
  deleteProduct(id: string): Observable<any> { return this.http.delete<any>(`${API_BASE}/products/${id}`, { headers: this.authHeaders() }); }
  uploadImage(file: File, folder: string): Observable<HttpEvent<{ url: string }>> {
    const fd = new FormData(); fd.append('image', file);
    return this.http.post<{ url: string }>(`${API_BASE}/upload/${folder}`, fd, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }),
      reportProgress: true,
      observe: 'events'
    });
  }
  placeOrder(order: any): Observable<any> { return this.http.post<any>(`${API_BASE}/orders`, order); }
  getOrders(): Observable<any[]> { return this.http.get<any[]>(`${API_BASE}/orders`, { headers: this.authHeaders() }); }
  updateOrderStatus(id: string, status?: string, paymentStatus?: string): Observable<any> {
    const body: any = {};
    if (status) body.status = status;
    if (paymentStatus) body.paymentStatus = paymentStatus;
    return this.http.patch<any>(`${API_BASE}/orders/${id}/status`, body, { headers: this.authHeaders() });
  }
  getContent(page: string): Observable<any> { return this.http.get<any>(`${API_BASE}/content/${page}`); }
  saveContent(page: string, data: any): Observable<any> { return this.http.put<any>(`${API_BASE}/content/${page}`, data, { headers: this.authHeaders() }); }
  subscribe(data: any): Observable<any> { return this.http.post<any>(`${API_BASE}/subscribers`, data); }
  getSubscribers(): Observable<any[]> { return this.http.get<any[]>(`${API_BASE}/subscribers`, { headers: this.authHeaders() }); }
  removeSubscriber(id: string): Observable<any> { return this.http.delete<any>(`${API_BASE}/subscribers/${id}`, { headers: this.authHeaders() }); }
  getBlogPosts(all = false): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE}/blog${all ? '?all=true' : ''}`, all ? { headers: this.authHeaders() } : {})
      .pipe(map(posts => posts.map(p => this.withId(p))));
  }
  addBlogPost(data: any): Observable<any> { return this.http.post<any>(`${API_BASE}/blog`, data, { headers: this.authHeaders() }).pipe(map(p => this.withId(p))); }
  updateBlogPost(id: string, data: any): Observable<any> { return this.http.put<any>(`${API_BASE}/blog/${id}`, data, { headers: this.authHeaders() }).pipe(map(p => this.withId(p))); }
  deleteBlogPost(id: string): Observable<any> { return this.http.delete<any>(`${API_BASE}/blog/${id}`, { headers: this.authHeaders() }); }
}