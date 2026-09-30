import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BlogService, BlogPost } from '../services/blog.service';
import { SiteContentService, SiteContent } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-blog',
  standalone: false,
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit, OnDestroy {
  allPosts: BlogPost[] = [];
  filtered: BlogPost[] = [];
  images: SiteContent = {};
  selectedCategory = '';
  categories: string[] = [];
  expandedId: string | null = null;
  private subs: Subscription[] = [];

  constructor(private blogSvc: BlogService, private contentSvc: SiteContentService, private seoSvc: SeoService) {}

  ngOnInit(): void {
    this.subs.push(
      this.contentSvc.getContent('seo-blog').subscribe(d => {
        if (d && Object.keys(d).length) this.seoSvc.set({ title: d.seoTitle, description: d.seoDescription, keywords: d.seoKeywords, ogImage: d.seoOgImage });
        else this.seoSvc.set({ title: 'Blog', description: 'Style tips, fashion inspiration and behind-the-scenes stories from NamakwaChic.' });
      }),
      this.blogSvc.getAll().subscribe(posts => {
        this.allPosts = posts.filter(p => p.published).sort((a,b) =>
          new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime()
        );
        this.categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
        this.applyFilter();
      }),
      this.contentSvc.getContent('images').subscribe(d => { if (d) this.images = d; })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  applyFilter(): void {
    this.filtered = this.selectedCategory
      ? this.allPosts.filter(p => p.category === this.selectedCategory)
      : [...this.allPosts];
  }

  get featured(): BlogPost | null { return this.filtered[0] || null; }
  get rest(): BlogPost[] { return this.filtered.slice(1); }

  toggle(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }
}