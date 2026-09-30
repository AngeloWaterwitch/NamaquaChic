import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}
  get isLoggedIn$() { return this.api.isLoggedIn$; }
  login(email: string, password: string) { return this.api.login(email, password); }
  logout() { this.api.logout(); }
}
