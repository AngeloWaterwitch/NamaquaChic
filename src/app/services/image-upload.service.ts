import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  constructor(private api: ApiService) {}
  upload(file: File, folder: string): Observable<{ url: string }> { return this.api.uploadImage(file, folder); }
}
