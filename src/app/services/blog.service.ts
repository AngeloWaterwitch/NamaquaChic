import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
export interface BlogPost {
  id?: string; _id?: string; title: string; excerpt: string; content: string;
  image: string; category: string; author: string;
  published: boolean; trending: boolean; tags: any; publishedAt?: any; createdAt?: any;
}
@Injectable({ providedIn: 'root' })
export class BlogService {
  constructor(private api: ApiService) {}
  getAll(all = false): Observable<BlogPost[]> { return this.api.getBlogPosts(all); }
  add(data: Partial<BlogPost>): Observable<BlogPost> { return this.api.addBlogPost(data); }
  update(id: string, data: Partial<BlogPost>): Observable<BlogPost> { return this.api.updateBlogPost(id, data); }
  delete(id: string): Observable<any> { return this.api.deleteBlogPost(id); }
}
