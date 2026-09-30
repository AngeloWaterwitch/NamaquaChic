import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteContentService, SiteContent } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';

@Component({ selector: 'app-about', standalone: false, templateUrl: './about.component.html', styleUrl: './about.component.css' })
export class AboutComponent implements OnInit, OnDestroy {
  about: SiteContent = {};
  images: SiteContent = {};
  private subs: Subscription[] = [];
  constructor(private contentSvc: SiteContentService, private seoSvc: SeoService) {}
  ngOnInit(): void {
    this.subs.push(
      this.contentSvc.getContent('seo-about').subscribe(d => {
        if (d && Object.keys(d).length) this.seoSvc.set({ title: d.seoTitle, description: d.seoDescription, keywords: d.seoKeywords, ogImage: d.seoOgImage });
        else this.seoSvc.set({ title: 'About Us', description: 'Learn the story behind NamakwaChic — our values, our vision, and our love for earthy desert fashion.' });
      }),
      this.contentSvc.getContent('about').subscribe(d => { if (d) this.about = d; }),
      this.contentSvc.getContent('images').subscribe(d => { if (d) this.images = d; })
    );
  }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}
