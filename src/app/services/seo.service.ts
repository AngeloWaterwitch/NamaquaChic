import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
}

// Default fallbacks for every page
const SITE_NAME = 'NamakwaChic';
const DEFAULT_DESCRIPTION = 'Curated fashion from the Namakwa desert. Discover our latest collections of earthy, elegant pieces.';
const DEFAULT_OG_IMAGE = 'https://namakwachic.co.za/assets/og-default.jpg';

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(private title: Title, private meta: Meta) {}

  set(config: SeoConfig): void {
    const pageTitle     = config.title ? `${config.title} | ${SITE_NAME}` : SITE_NAME;
    const description   = config.description   || DEFAULT_DESCRIPTION;
    const ogTitle       = config.ogTitle        || config.title || SITE_NAME;
    const ogDescription = config.ogDescription || description;
    const ogImage       = config.ogImage       || DEFAULT_OG_IMAGE;
    const ogUrl         = config.ogUrl         || (typeof window !== 'undefined' ? window.location.href : '');

    // Page title
    this.title.setTitle(pageTitle);

    // Standard meta
    this.upsert('description', description);
    if (config.keywords) this.upsert('keywords', config.keywords);

    // Open Graph (Facebook, WhatsApp, LinkedIn previews)
    this.upsert('og:title',       ogTitle,       true);
    this.upsert('og:description', ogDescription, true);
    this.upsert('og:image',       ogImage,       true);
    this.upsert('og:url',         ogUrl,         true);
    this.upsert('og:type',        'website',     true);
    this.upsert('og:site_name',   SITE_NAME,     true);

    // Twitter card
    this.upsert('twitter:card',        'summary_large_image', false, true);
    this.upsert('twitter:title',       ogTitle,               false, true);
    this.upsert('twitter:description', ogDescription,         false, true);
    this.upsert('twitter:image',       ogImage,               false, true);

    // Canonical URL
    this.setCanonical(config.canonical || ogUrl);
  }

  /** Reset to site defaults (used on 404 or bare routes) */
  reset(): void {
    this.set({ title: '', description: DEFAULT_DESCRIPTION });
  }

  private upsert(name: string, content: string, isProperty = false, isTwitter = false): void {
    if (!content) return;
    if (isProperty) {
      this.meta.updateTag({ property: name, content });
    } else if (isTwitter) {
      this.meta.updateTag({ name, content });
    } else {
      this.meta.updateTag({ name, content });
    }
  }

  private setCanonical(url: string): void {
    if (typeof document === 'undefined') return;
    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}