import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class SubscriberService {
  constructor(private api: ApiService) {}
  subscribe(data: any): Observable<any> { return this.api.subscribe(data); }
  getAll(): Observable<any[]> { return this.api.getSubscribers(); }
  remove(id: string): Observable<any> { return this.api.removeSubscriber(id); }
}
