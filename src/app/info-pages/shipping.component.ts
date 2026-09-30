import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteContentService, SiteContent } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-shipping',
  standalone: false,
  templateUrl: './shipping.component.html',
  styleUrls: ['./info.component.css']
})
export class ShippingComponent implements OnInit, OnDestroy {
  content: SiteContent = {};
  private sub!: Subscription;

  constructor(private contentSvc: SiteContentService, private seoSvc: SeoService) {}

  get nonReturnableItems(): string[] {
    return this.content.returnsNonReturnableItems
      ? this.content.returnsNonReturnableItems.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Sale items marked as final sale', 'Custom or personalised orders', 'Items that have been worn, washed, or had tags removed'];
  }

  ngOnInit(): void {
    this.seoSvc.set({ title: 'Shipping & Returns', description: 'NamakwaChic shipping policy. Free delivery, easy 30-day returns.' });
    this.sub = this.contentSvc.getContent('help-shipping').subscribe(d => { if (d) this.content = d; });
  }
  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}