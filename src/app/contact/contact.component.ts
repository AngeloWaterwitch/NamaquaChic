import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SiteContentService } from '../services/site-content.service';
import { SeoService } from '../services/seo.service';
import { ApiService } from '../services/api.service';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit, OnDestroy {
  contact: any = {};
  home: any    = {};
  images: any  = {};

  name = ''; email = ''; subject = ''; message = '';
  formSubmitting = false;
  formSubmitted  = false;
  formError      = '';
  newsletterEmail     = '';
  newsletterSubmitted = false;

  private subs: Subscription[] = [];

  constructor(
    private contentSvc: SiteContentService,
    private api: ApiService,
    private emailSvc: EmailService,
    private seoSvc: SeoService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.contentSvc.getContent('seo-contact').subscribe((d: any) => {
        if (d && Object.keys(d).length)
          this.seoSvc.set({ title: d.seoTitle, description: d.seoDescription, keywords: d.seoKeywords, ogImage: d.seoOgImage });
        else
          this.seoSvc.set({ title: 'Contact Us', description: 'Get in touch with NamakwaChic.' });
      }),
      this.contentSvc.getContent('contact').subscribe((d: any) => { if (d) this.contact = d; }),
      this.contentSvc.getContent('home').subscribe((d: any)    => { if (d) this.home    = d; }),
      this.contentSvc.getContent('images').subscribe((d: any)  => { if (d) this.images  = d; })
    );
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  async submitContactForm(): Promise<void> {
    if (!this.name || !this.email || !this.message) return;
    this.formSubmitting = true; this.formError = '';
    try {
      await this.emailSvc.sendContactForm({
        name: this.name, email: this.email,
        subject: this.subject || 'Message from NamakwaChic',
        message: this.message
      });
      this.formSubmitted = true;
      this.name = ''; this.email = ''; this.subject = ''; this.message = '';
    } catch {
      this.formError = 'Something went wrong. Please try again or email us directly.';
    }
    this.formSubmitting = false;
  }

  async submitNewsletter(): Promise<void> {
    if (!this.newsletterEmail) return;
    this.api.subscribe({ email: this.newsletterEmail, type: 'newsletter' }).subscribe();
    await this.emailSvc.sendNewsletterWelcome(this.newsletterEmail).catch(() => {});
    this.newsletterSubmitted = true;
  }
}