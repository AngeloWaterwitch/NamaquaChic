import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, filter } from 'rxjs';
import { CartItem } from './store/cart.reducer';
import { SiteContentService } from './services/site-content.service';
import { AuthService } from './services/auth.service';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'NamakwaChic';
  cartCount$: Observable<number>;
  isAdminRoute = false;
  searchQuery = '';
  searchOpen = false;
  menuOpen = false;
  bannerDismissed = false;
  currentBannerText = '';
  currentYear = new Date().getFullYear();
 
  // Maintenance mode
  maintenanceMode = false;
  maintenanceTitle = "We'll be back soon";
  maintenanceMessage = "We're making some improvements. Check back shortly.";
  maintenanceEstimate = '';
  maintenanceShowNotify = false;
  notifyEmail = '';
  notifySubmitted = false;
 
  // POPIA Cookie Consent
  showCookieBanner = false;
  cookieBannerVisible = false;
  cookieConsent: 'accepted' | 'declined' | null = null;
 
  // Announcement banner
  banner: any = {};

  // Full 'home' content, always populated regardless of bannerEnabled state —
  // used for site-wide things that aren't the banner itself, e.g. footer socials.
  homeContent: any = {};
 
  // Theme
  theme: any = {};
 
  constructor(
    private store: Store<{ cart: CartItem[] }>,
    private router: Router,
    public contentSvc: SiteContentService,
    public auth: AuthService
  ) {
    this.cartCount$ = this.store.select(state => state.cart.length);
 
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isAdminRoute = e.urlAfterRedirects.startsWith('/admin');
      this.closeMenu();
    });
  }
 
  ngOnInit(): void {
    // One-time: clear any stale banner dismiss key from previous sessions
    // (will be re-evaluated properly once Firestore data loads)
    this.bannerDismissed = false;
 
    this.contentSvc.getContent('theme').subscribe((data: any) => {
      if (data && Object.keys(data).length) this.applyTheme(data);
    });
 
    // Banner — single subscription to 'home', also handles dismiss tracking
    this.contentSvc.getContent('home').subscribe((data: any) => {
      if (data && Object.keys(data).length) {
        this.homeContent = data;

        // Only update banner fields if bannerEnabled is explicitly true
        if (data.bannerEnabled === true) {
          this.banner = data;
          this.currentBannerText = data.bannerText || '';
          const dismissedFor = sessionStorage.getItem('nc_banner_dismissed_for');
          this.bannerDismissed = !!dismissedFor && dismissedFor === data.bannerText;
        } else if (data.bannerEnabled === false) {
          // Admin explicitly turned it off
          this.banner = data;
          this.bannerDismissed = false;
        }
        // if bannerEnabled is undefined (first empty emit), ignore it
      }
    });
 
    // Watch maintenance mode
    this.contentSvc.getContent('maintenance').subscribe((data: any) => {
      if (data) {
        this.maintenanceMode        = !!data.maintenanceMode;
        this.maintenanceTitle       = data.maintenanceTitle       || "We'll be back soon";
        this.maintenanceMessage     = data.maintenanceMessage     || "We're making some improvements. Check back shortly.";
        this.maintenanceEstimate    = data.maintenanceEstimate    || '';
        this.maintenanceShowNotify  = !!data.maintenanceShowNotify;
      }
    });
 
    // POPIA Cookie Consent — show banner if user hasn't responded yet
    const savedConsent = localStorage.getItem('nc_cookie_consent');
    if (!savedConsent) {
      setTimeout(() => {
        this.showCookieBanner = true;
        setTimeout(() => this.cookieBannerVisible = true, 50);
      }, 1500);
    } else {
      this.cookieConsent = savedConsent as 'accepted' | 'declined';
    }
  }
 
  applyTheme(t: any): void {
    const root = document.documentElement;
    if (t.colorMahogany)   root.style.setProperty('--mahogany',   t.colorMahogany);
    if (t.colorTobacco)    root.style.setProperty('--tobacco',    t.colorTobacco);
    if (t.colorTobaccoLt)  root.style.setProperty('--tobacco-lt', t.colorTobaccoLt);
    if (t.colorVanilla)    root.style.setProperty('--vanilla',    t.colorVanilla);
    if (t.colorVanillaDk)  root.style.setProperty('--vanilla-dk', t.colorVanillaDk);
    if (t.colorMountain)   root.style.setProperty('--mountain',   t.colorMountain);
    if (t.colorSand)       root.style.setProperty('--sand',       t.colorSand);
    if (t.fontHeading)     root.style.setProperty('--font-heading', `'${t.fontHeading}', serif`);
    if (t.fontBody)        root.style.setProperty('--font-body',    `'${t.fontBody}', sans-serif`);
  }
 
  doSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
      this.searchOpen = false;
    }
  }
 
  toggleSearch(): void { this.searchOpen = !this.searchOpen; }
  toggleMenu(): void { this.menuOpen = !this.menuOpen; if (this.menuOpen) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; }
  closeMenu(): void { this.menuOpen = false; document.body.style.overflow = ''; }
  dismissBanner(): void {
    this.bannerDismissed = true;
    // Store which banner was dismissed so a new banner auto-shows again
    sessionStorage.setItem('nc_banner_dismissed_for', this.currentBannerText);
  }
 
  submitNotify(): void {
    if (this.notifyEmail) this.notifySubmitted = true;
  }
 
  // ── POPIA Cookie Consent ──
  acceptCookies(): void {
    this.cookieConsent = 'accepted';
    localStorage.setItem('nc_cookie_consent', 'accepted');
    this.closeCookieBanner();
  }
 
  declineCookies(): void {
    this.cookieConsent = 'declined';
    localStorage.setItem('nc_cookie_consent', 'declined');
    this.closeCookieBanner();
  }
 
  closeCookieBanner(): void {
    this.cookieBannerVisible = false;
    setTimeout(() => this.showCookieBanner = false, 400);
  }
}