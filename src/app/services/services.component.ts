import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteContentService, SiteContent } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';

@Component({ selector: 'app-services', standalone: false, templateUrl: './services.component.html', styleUrl: './services.component.css' })
export class ServicesComponent implements OnInit, OnDestroy {
  services: SiteContent = {};
  images: SiteContent = {};
  showDelivery = false;
  private subs: Subscription[] = [];
  constructor(private contentSvc: SiteContentService, private seoSvc: SeoService) {}
  ngOnInit(): void {
    this.subs.push(
      this.contentSvc.getContent('seo-services').subscribe(d => {
        if (d && Object.keys(d).length) this.seoSvc.set({ title: d.seoTitle, description: d.seoDescription, keywords: d.seoKeywords, ogImage: d.seoOgImage });
        else this.seoSvc.set({ title: 'Services', description: 'Explore styling, personal shopping, and delivery services from NamakwaChic.' });
      }),
      this.contentSvc.getContent('services').subscribe(d => { if (d) this.services = d; }),
      this.contentSvc.getContent('images').subscribe(d => { if (d) this.images = d; })
    );
  }
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
}