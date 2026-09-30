import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteContentService } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';
import { ProductService, Product } from '../services/product.service';
import { ApiService } from '../services/api.service';
import { EmailService } from '../services/email.service';
 
@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  home: any = {};
  images: any = {};
  media: any = {};
  featuredProducts: Product[] = [];
  upcomingDrops: Product[] = [];
 
  carouselIndex = 0;
  notifyEmail = '';
  notifyProduct = '';
  notifyMsg = '';
  newsletterEmail = '';
  newsletterMsg = '';
 
  private subs: Subscription[] = [];
 
  constructor(
    private contentSvc: SiteContentService,
    private productSvc: ProductService,
    private api: ApiService,
    private emailSvc: EmailService,
    private seoSvc: SeoService
  ) {}
 
  ngOnInit(): void {
    this.subs.push(
      this.contentSvc.getContent('seo-home').subscribe((d: any) => {
        if (d && Object.keys(d).length) {
          this.seoSvc.set({ title: d.seoTitle, description: d.seoDescription, keywords: d.seoKeywords, ogImage: d.seoOgImage });
        } else {
          this.seoSvc.set({ title: 'Home', description: 'Curated fashion from the Namakwa desert.' });
        }
      }),
      this.contentSvc.getContent('home').subscribe((d: any) => { if (d) this.home = d; }),
      this.contentSvc.getContent('images').subscribe((d: any) => { if (d) this.images = d; }),
      this.contentSvc.getContent('media').subscribe((d: any) => { if (d) this.media = d; }),
      this.productSvc.getAll().subscribe((products: Product[]) => {
        this.featuredProducts = products.filter((p: any) => p.isLive && p.published !== false && p.status !== 'outofstock');
        this.upcomingDrops    = products.filter((p: any) => p.status === 'comingsoon' || p.badge === 'Limited');
      })
    );
  }
 
  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }
 
  prev(): void { this.carouselIndex = (this.carouselIndex - 1 + this.featuredProducts.length) % this.featuredProducts.length; }
  next(): void { this.carouselIndex = (this.carouselIndex + 1) % this.featuredProducts.length; }
  goTo(i: number): void { this.carouselIndex = i; }
  get currentProduct(): Product | null { return this.featuredProducts[this.carouselIndex] || null; }
 
  async notifyMe(productName: string): Promise<void> {
    if (!this.notifyEmail) return;
    this.api.subscribe({ email: this.notifyEmail, type: 'notify', productName }).subscribe();
    this.notifyMsg = 'We will notify you when this drops!';
    this.notifyEmail = '';
    setTimeout(() => this.notifyMsg = '', 3000);
  }
 
  async subscribeNewsletter(): Promise<void> {
    if (!this.newsletterEmail) return;
    this.api.subscribe({ email: this.newsletterEmail, type: 'newsletter' }).subscribe();
    this.emailSvc.sendNewsletterWelcome(this.newsletterEmail).catch(() => {});
    this.newsletterMsg = 'You are on the list!';
    this.newsletterEmail = '';
    setTimeout(() => this.newsletterMsg = '', 3000);
  }
 
  getVideoEmbed(): string {
    const url  = this.media['videoUrl']  || '';
    const type = this.media['videoType'] || '';
    if (type === 'youtube') {
      const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
      return id ? 'https://www.youtube.com/embed/' + id + '?rel=0' : '';
    }
    if (type === 'vimeo') {
      const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return id ? 'https://player.vimeo.com/video/' + id : '';
    }
    return url;
  }
}