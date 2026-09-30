import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteContentService } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';

interface Faq { q: string; a: string; open: boolean; }

@Component({
  selector: 'app-faqs',
  standalone: false,
  templateUrl: './faqs.component.html',
  styleUrls: ['./info.component.css']
})
export class FaqsComponent implements OnInit, OnDestroy {
  faqs: Faq[] = [];
  intro = '';
  private sub!: Subscription;

  constructor(private contentSvc: SiteContentService, private seoSvc: SeoService) {}

  ngOnInit(): void {
    this.seoSvc.set({ title: 'FAQs', description: 'Frequently asked questions about NamakwaChic — ordering, shipping, returns and more.' });
    this.sub = this.contentSvc.getContent('help-faqs').subscribe(d => {
      if (d) {
        this.intro = d.faqsIntro || '';
        try {
          const parsed = d.faqsData ? JSON.parse(d.faqsData) : [];
          this.faqs = parsed.map((f: { q: string; a: string }) => ({ ...f, open: false }));
        } catch { this.faqs = []; }
      }
    });
  }

  toggle(faq: Faq): void { faq.open = !faq.open; }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}