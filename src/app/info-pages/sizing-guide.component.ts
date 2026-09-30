import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteContentService, SiteContent } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-sizing-guide',
  standalone: false,
  templateUrl: './sizing-guide.component.html',
  styleUrls: ['./info.component.css']
})
export class SizingGuideComponent implements OnInit, OnDestroy {
  content: SiteContent = {};
  private sub!: Subscription;

  constructor(private contentSvc: SiteContentService, private seoSvc: SeoService) {}

  ngOnInit(): void {
    this.seoSvc.set({ title: 'Size Guide', description: 'Find your perfect fit with the NamakwaChic size guide.' });
    this.sub = this.contentSvc.getContent('help-sizing').subscribe(d => { if (d) this.content = d; });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}