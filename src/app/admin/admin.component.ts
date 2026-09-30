import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from '../services/api.service';
import { SiteContentService } from '../services/site-content.service';
 
type AdminSection =
  'dashboard'|'home'|'about'|'services'|'products'|'blog'|
  'contact'|'subscribers'|'theme'|'media'|'images'|'maintenance'|
  'orders'|'seo'|'analytics'|'help-sizing'|'help-shipping'|'help-faqs';
 
@Component({
  selector: 'app-admin',
  standalone: false,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
 
  activeSection: AdminSection = 'dashboard';
  saving   = false;
  saveMsg  = '';
  errorMsg = '';
  sidebarOpen = false;
 
  loginEmail    = '';
  loginPassword = '';
  loginError    = '';
  loggingIn     = false;
 
  homeContent:        any = {};
  aboutContent:       any = {};
  servicesContent:    any = {};
  contactContent:     any = {};
  themeContent:       any = {};
  mediaContent:       any = {};
  imagesContent:      any = {};
  maintenanceContent: any = {};
  seoHome:     any = {}; seoAbout:    any = {};
  seoServices: any = {}; seoBlog:     any = {};
  seoShop:     any = {}; seoContact:  any = {};
  helpSizing:   any = {};
  helpShipping: any = {};
  helpFaqs:     any = {};
  faqList: { q: string; a: string }[] = [];
 
  products:    any[] = [];
  orders:      any[] = [];
  blogs:       any[] = [];
  subscribers: any[] = [];
 
  ordersLoading    = false;
  ordersFilter     = 'all';
  selectedOrder: any = null;
  updatingOrderId: string | null = null;
  removingSubscriberId: string | null = null;
 
  editingProduct: any = null;
  showProductForm = false;
  productForm: any = this.emptyProduct();
 
  editingBlog: any = null;
  showBlogForm = false;
  blogForm: any = this.emptyBlog();
 
  categories     = ['Dresses','Tops','Jumpsuits','Trousers','Skirts','Outerwear','Accessories','Sets'];
  showNewCategory = false;
  newCategoryName = '';
  badges: any[]  = ['','Bestseller','New','Limited','Sale'];
  blogCategories = ['Trends','Sustainability','Style Guide','Behind the Brand','Events'];
  headingFonts   = ['Cormorant Garamond','Playfair Display','Libre Baskerville','EB Garamond','Lora','Merriweather'];
  bodyFonts      = ['Jost','Inter','Poppins','Raleway','Nunito','Lato','Montserrat','Open Sans'];
 
  colorPresets = [
    { name:'Earth (Default)',  mahogany:'#584739', tobacco:'#B59E7D', tobaccoLt:'#D4C4A8', vanilla:'#F1EADA', vanillaDk:'#E8DEC8', mountain:'#AAA396', sand:'#CEC1A8' },
    { name:'Midnight Rose',    mahogany:'#2D1B2E', tobacco:'#C9778A', tobaccoLt:'#E8B4BC', vanilla:'#FDF0F2', vanillaDk:'#F5D9DE', mountain:'#A08090', sand:'#D4B0B8' },
    { name:'Sage & Ivory',     mahogany:'#2C3E2D', tobacco:'#7D9E7F', tobaccoLt:'#A8C4A9', vanilla:'#F4F5EE', vanillaDk:'#E5E8DB', mountain:'#899A8B', sand:'#C4CBBB' },
    { name:'Navy & Gold',      mahogany:'#1A2744', tobacco:'#C9A84C', tobaccoLt:'#E2C97E', vanilla:'#F5F2E8', vanillaDk:'#EDE8D5', mountain:'#8090AA', sand:'#C8C0A0' },
    { name:'Blush & Charcoal', mahogany:'#2A2A2A', tobacco:'#D4A5A0', tobaccoLt:'#E8C8C5', vanilla:'#FDF5F4', vanillaDk:'#F5E8E6', mountain:'#999090', sand:'#DCC8C6' },
  ];
 
  constructor(public api: ApiService, private contentSvc: SiteContentService) {}
 
  ngOnInit(): void { this.loadAll(); }
 
  loadAll(): void {
    if (!this.api.hasToken()) return;
    this.api.getProducts().subscribe(p => this.products = p);
    this.api.getBlogPosts(true).subscribe(b => this.blogs = b);
    this.api.getSubscribers().subscribe(s => this.subscribers = s);
    this.loadOrders();
    this.api.getContent('categories').subscribe((d: any) => {
      if (d && Array.isArray(d.list) && d.list.length) this.categories = d.list;
    });
    const pages = ['home','about','services','contact','theme','media','images','maintenance',
      'seo-home','seo-about','seo-services','seo-blog','seo-shop','seo-contact',
      'help-sizing','help-shipping','help-faqs'];
    pages.forEach(p => this.api.getContent(p).subscribe((d: any) => this.setPageContent(p, d)));
  }
 
  setPageContent(page: string, d: any): void {
    if (!d) return;
    const map: any = {
      home:'homeContent', about:'aboutContent', services:'servicesContent',
      contact:'contactContent', theme:'themeContent', media:'mediaContent',
      images:'imagesContent', maintenance:'maintenanceContent',
      'seo-home':'seoHome','seo-about':'seoAbout','seo-services':'seoServices',
      'seo-blog':'seoBlog','seo-shop':'seoShop','seo-contact':'seoContact',
      'help-sizing':'helpSizing','help-shipping':'helpShipping','help-faqs':'helpFaqs',
    };
    if (map[page]) {
      (this as any)[map[page]] = { ...(this as any)[map[page]], ...d };
      if (page === 'help-faqs') {
        try { this.faqList = d.faqsData ? JSON.parse(d.faqsData) : []; } catch { this.faqList = []; }
      }
    }
  }
 
  setSection(s: AdminSection): void { this.activeSection = s; this.sidebarOpen = false; }
  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
 
  doLogin(): void {
    this.loggingIn = true; this.loginError = '';
    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => { this.loggingIn = false; this.loadAll(); },
      error: (e: any) => { this.loginError = e.error?.message || 'Invalid email or password'; this.loggingIn = false; }
    });
  }
 
  logout(): void { this.api.logout(); }
 
  saveContent(page: string): void {
    this.saving = true;
    const map: any = {
      home:this.homeContent, about:this.aboutContent, services:this.servicesContent,
      contact:this.contactContent, theme:this.themeContent, media:this.mediaContent,
      images:this.imagesContent, maintenance:this.maintenanceContent,
      'seo-home':this.seoHome,'seo-about':this.seoAbout,'seo-services':this.seoServices,
      'seo-blog':this.seoBlog,'seo-shop':this.seoShop,'seo-contact':this.seoContact,
      'help-sizing':this.helpSizing,'help-shipping':this.helpShipping,
      'help-faqs':{ ...this.helpFaqs, faqsData: JSON.stringify(this.faqList) },
    };
    this.api.saveContent(page, map[page]).subscribe({
      next: () => { this.flash('✓ Saved'); this.saving = false; },
      error: () => { this.flashErr('Save failed'); this.saving = false; }
    });
  }
 
  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    if (!this.categories.includes(name)) {
      this.categories = [...this.categories, name];
      this.api.saveContent('categories', { list: this.categories }).subscribe({
        next: () => this.flash('✓ Category added'),
        error: () => this.flashErr('Could not save new category')
      });
    }
    this.productForm.category = name;
    this.newCategoryName = '';
    this.showNewCategory = false;
  }

  applyPreset(p: any): void {
    this.themeContent.colorMahogany  = p.mahogany;
    this.themeContent.colorTobacco   = p.tobacco;
    this.themeContent.colorTobaccoLt = p.tobaccoLt;
    this.themeContent.colorVanilla   = p.vanilla;
    this.themeContent.colorVanillaDk = p.vanillaDk;
    this.themeContent.colorMountain  = p.mountain;
    this.themeContent.colorSand      = p.sand;
    this.saveContent('theme');
  }
 
  // ── PRODUCTS ─────────────────────────────────────────────────────
  openProductForm(p?: any): void {
    this.editingProduct  = p || null;
    this.productForm     = p ? { ...p, colours: Array.isArray(p.colours) ? p.colours.join(', ') : p.colours } : this.emptyProduct();
    this.showProductForm = true;
  }
  closeProductForm(): void { this.showProductForm = false; this.editingProduct = null; }
 
  saveProduct(): void {
    if (!this.productForm.name || !this.productForm.price) return;
    this.saving = true;
    const data = {
      ...this.productForm,
      colours: typeof this.productForm.colours === 'string'
        ? this.productForm.colours.split(',').map((c: string) => c.trim()).filter(Boolean)
        : this.productForm.colours,
      price: Number(this.productForm.price),
      originalPrice: this.productForm.originalPrice ? Number(this.productForm.originalPrice) : undefined,
    };
    const call = this.editingProduct?._id
      ? this.api.updateProduct(this.editingProduct._id, data)
      : this.api.addProduct(data);
    call.subscribe({
      next: (saved: any) => {
        this.products = this.editingProduct?._id
          ? this.products.map(p => p._id === saved._id ? saved : p)
          : [saved, ...this.products];
        this.closeProductForm(); this.flash('✓ Product saved'); this.saving = false;
      },
      error: () => { this.flashErr('Save failed'); this.saving = false; }
    });
  }
 
  deleteProduct(id: string): void {
    if (!confirm('Delete this product?')) return;
    this.api.deleteProduct(id).subscribe({
      next: () => { this.products = this.products.filter(p => p._id !== id); this.flash('Product deleted'); },
      error: () => this.flashErr('Delete failed')
    });
  }
 
  toggleSize(s: string): void {
    const arr: string[] = this.productForm.sizes || [];
    const i = arr.indexOf(s);
    i > -1 ? arr.splice(i,1) : arr.push(s);
    this.productForm.sizes = [...arr];
  }
  hasSize(s: string): boolean { return (this.productForm.sizes || []).includes(s); }
 
  emptyProduct(): any {
    return { name:'', category:'Dresses', price:0, description:'', image:'',
             sizes:[], colours:'', material:'', type:'', status:'instock',
             badge:'', published:true, isLive:false, quantity:0, selectedSize:'' };
  }
 
  // ── BLOG ─────────────────────────────────────────────────────────
  openBlogForm(b?: any): void {
    this.editingBlog  = b || null;
    this.blogForm     = b ? { ...b, tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags } : this.emptyBlog();
    this.showBlogForm = true;
  }
  closeBlogForm(): void { this.showBlogForm = false; this.editingBlog = null; }
 
  saveBlog(): void {
    if (!this.blogForm.title) return;
    this.saving = true;
    const data = {
      ...this.blogForm,
      tags: typeof this.blogForm.tags === 'string'
        ? this.blogForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : this.blogForm.tags,
      publishedAt: this.blogForm.published ? new Date() : null,
    };
    const call = this.editingBlog?._id
      ? this.api.updateBlogPost(this.editingBlog._id, data)
      : this.api.addBlogPost(data);
    call.subscribe({
      next: (saved: any) => {
        this.blogs = this.editingBlog?._id
          ? this.blogs.map(b => b._id === saved._id ? saved : b)
          : [saved, ...this.blogs];
        this.closeBlogForm(); this.flash('✓ Post saved'); this.saving = false;
      },
      error: () => { this.flashErr('Save failed'); this.saving = false; }
    });
  }
 
  deleteBlog(id: string): void {
    if (!confirm('Delete this post?')) return;
    this.api.deleteBlogPost(id).subscribe({
      next: () => { this.blogs = this.blogs.filter(b => b._id !== id); this.flash('Post deleted'); },
      error: () => this.flashErr('Delete failed')
    });
  }
 
  emptyBlog(): any {
    return { title:'', excerpt:'', content:'', image:'', category:'Trends',
             author:'NamakwaChic', published:false, trending:false, tags:'' };
  }
 
  // ── ORDERS ───────────────────────────────────────────────────────
  loadOrders(): void {
    this.ordersLoading = true;
    this.api.getOrders().subscribe({
      next: o => { this.orders = o; this.ordersLoading = false; },
      error: () => { this.ordersLoading = false; }
    });
  }
 
  get filteredOrders(): any[] {
    return this.ordersFilter === 'all' ? this.orders : this.orders.filter(o => o.status === this.ordersFilter);
  }
  ordersByStatus(status: string): number { return this.orders.filter(o => o.status === status).length; }
 
  updateStatus(order: any, status: string): void {
    if (!order?._id) return;
    this.updatingOrderId = order._id;
    this.api.updateOrderStatus(order._id, status).subscribe({
      next: (updated: any) => {
        this.orders = this.orders.map(o => o._id === updated._id ? updated : o);
        if (this.selectedOrder?._id === updated._id) this.selectedOrder = updated;
        this.flash('✓ Status updated'); this.updatingOrderId = null;
      },
      error: () => { this.flashErr('Update failed'); this.updatingOrderId = null; }
    });
  }

  markPaid(order: any): void {
    if (!order?._id) return;
    this.updatingOrderId = order._id;
    this.api.updateOrderStatus(order._id, undefined, 'paid').subscribe({
      next: (updated: any) => {
        this.orders = this.orders.map(o => o._id === updated._id ? updated : o);
        if (this.selectedOrder?._id === updated._id) this.selectedOrder = updated;
        this.flash('✓ Marked as paid'); this.updatingOrderId = null;
      },
      error: () => { this.flashErr('Update failed'); this.updatingOrderId = null; }
    });
  }
 
  openOrder(o: any): void  { this.selectedOrder = o; }
  closeOrder(): void        { this.selectedOrder = null; }
 
  // ── SUBSCRIBERS ──────────────────────────────────────────────────
  removeSubscriber(id: string): void {
    if (!id || !confirm('Remove this subscriber?')) return;
    this.removingSubscriberId = id;
    this.api.removeSubscriber(id).subscribe({
      next: () => { this.subscribers = this.subscribers.filter(s => s._id !== id); this.flash('✓ Removed'); this.removingSubscriberId = null; },
      error: () => { this.flashErr('Failed'); this.removingSubscriberId = null; }
    });
  }
 
  // ── ANALYTICS ────────────────────────────────────────────────────
  get totalRevenue(): number { return this.orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + (o.total||0), 0); }
  get paidRevenue(): number { return this.orders.filter(o => o.paymentStatus === 'paid').reduce((s,o) => s + (o.total||0), 0); }
  get avgOrderValue(): number { const v = this.orders.filter(o => o.status !== 'cancelled'); return v.length ? this.totalRevenue/v.length : 0; }
  get totalItemsSold(): number { return this.orders.filter(o => o.status !== 'cancelled').reduce((s,o) => s + (o.items||[]).reduce((si:number,i:any) => si+i.quantity, 0), 0); }
 
  get revenueByMonth(): { month: string; revenue: number }[] {
    const map: Record<string,number> = {};
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.orders.filter(o => o.status !== 'cancelled' && o.createdAt).forEach(o => {
      const d = new Date(o.createdAt);
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      map[key] = (map[key]||0) + (o.total||0);
    });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue })).slice(-6);
  }
  get maxMonthRevenue(): number { return Math.max(...this.revenueByMonth.map(m => m.revenue), 1); }
 
  get ordersByStatusChart(): any[] {
    return ['pending','confirmed','processing','shipped','delivered','cancelled']
      .map(s => ({ label:s, count:this.orders.filter(o => o.status===s).length, colour:this.statusColour(s) }))
      .filter(s => s.count > 0);
  }
 
  get topProducts(): any[] {
    const map: Record<string,any> = {};
    this.orders.filter(o => o.status !== 'cancelled').forEach(o =>
      (o.items||[]).forEach((item:any) => {
        if (!map[item.name]) map[item.name] = { qty:0, revenue:0 };
        map[item.name].qty     += item.quantity;
        map[item.name].revenue += item.price * item.quantity;
      })
    );
    return Object.entries(map).map(([name,v]:any) => ({ name,...v })).sort((a,b) => b.revenue-a.revenue).slice(0,8);
  }
  get maxProductRevenue(): number { return Math.max(...this.topProducts.map(p => p.revenue), 1); }
  get recentOrders(): any[] { return [...this.orders].slice(0,5); }
 
  statusColour(status: string): string {
    const map: Record<string,string> = {
      pending:'#E67E22', confirmed:'#2980B9', processing:'#8E44AD',
      shipped:'#16A085', delivered:'#27AE60', cancelled:'#C0392B'
    };
    return map[status] || '#999';
  }
 
  // ── FAQs ─────────────────────────────────────────────────────────
  addFaq(): void { this.faqList = [...this.faqList, { q:'', a:'' }]; }
  removeFaq(i: number): void { this.faqList = this.faqList.filter((_,idx) => idx !== i); }
  moveFaq(i: number, dir: -1|1): void {
    const j = i + dir;
    if (j < 0 || j >= this.faqList.length) return;
    const list = [...this.faqList];
    [list[i], list[j]] = [list[j], list[i]];
    this.faqList = list;
  }
  saveFaqs(): void { this.helpFaqs.faqsData = JSON.stringify(this.faqList); this.saveContent('help-faqs'); }
 
  getVideoEmbedUrl(): string {
    const url = this.mediaContent.videoUrl || '';
    if (this.mediaContent.videoType === 'youtube') {
      const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : '';
    }
    if (this.mediaContent.videoType === 'vimeo') {
      const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : '';
    }
    return url;
  }
 
  dismissSaveMsg(): void { this.saveMsg = ''; }
  dismissErrorMsg(): void { this.errorMsg = ''; }

  private flash(msg: string): void { this.saveMsg = msg; this.errorMsg = ''; setTimeout(() => this.saveMsg = '', 3000); }
  private flashErr(msg: string): void { this.errorMsg = msg; this.saveMsg = ''; setTimeout(() => this.errorMsg = '', 4000); }
}