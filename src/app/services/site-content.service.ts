import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
export interface SiteContent { [key: string]: any; }
@Injectable({ providedIn: 'root' })
export class SiteContentService {
  constructor(private api: ApiService) {}
  getContent(page: string): Observable<any> { return this.api.getContent(page); }
  saveContent(page: string, data: any): Observable<any> { return this.api.saveContent(page, data); }
}
