import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  constructor(private api: ApiService) {}

  upload(file: File, folder: string): Observable<{ url: string }> {
    return this.api.uploadImage(file, folder).pipe(
      filter((event): event is HttpResponse<{ url: string }> => event.type === HttpEventType.Response),
      map(event => event.body as { url: string })
    );
  }
}
