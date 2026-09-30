import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
 
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  canActivate(): boolean {
    // Auth is handled inside AdminComponent itself
    return true;
  }
}