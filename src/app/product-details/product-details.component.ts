import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../services/product.service';
import * as CartActions from '../store/cart.actions';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  notFound = false;

  selectedSize = '';
  selectedColour = '';
  selectedImageIndex = 0;
  quantity = 1;

  addedToCart = false;
  sizeError = false;

  allImages: string[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productSvc: ProductService,
    private store: Store<any>,
    private seoSvc: SeoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) this.loadProduct(id);
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.notFound = false;
    this.selectedSize = '';
    this.selectedColour = '';
    this.selectedImageIndex = 0;
    this.quantity = 1;
    this.addedToCart = false;

    this.productSvc.getAll().pipe(takeUntil(this.destroy$)).subscribe(products => {
      const found = products.find(p => p.id === id);
      if (!found) { this.notFound = true; this.loading = false; return; }

      this.product = found;
      this.loading = false;

      this.seoSvc.set({
        title:       found.name,
        description: found.description || `Shop ${found.name} from NamakwaChic. ${found.category} — R${found.price}`,
        ogImage:     found.image,
        keywords:    [found.category, found.name, 'NamakwaChic', 'fashion', 'South Africa'].join(', ')
      });

      this.allImages = [found.image, ...(found.images || [])].filter(Boolean);

      const colours = this.getColours(found);
      if (colours.length === 1) this.selectedColour = colours[0];

      this.relatedProducts = products
        .filter(p => p.category === found.category && p.id !== id && p.published !== false)
        .slice(0, 4);
    });
  }

  getColours(product: Product): string[] {
    if (!product.colours) return [];
    if (Array.isArray(product.colours)) return product.colours;
    if (typeof product.colours === 'string') return product.colours.split(',').map(c => c.trim()).filter(Boolean);
    return [];
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    this.sizeError = false;
  }

  selectColour(colour: string): void { this.selectedColour = colour; }
  selectImage(i: number): void { this.selectedImageIndex = i; }

  changeQty(delta: number): void {
    this.quantity = Math.max(1, Math.min(10, this.quantity + delta));
  }

  addToCart(): void {
    if (!this.product) return;
    if (this.product.sizes?.length && !this.selectedSize) {
      this.sizeError = true;
      document.querySelector('.pd-sizes')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    for (let i = 0; i < this.quantity; i++) {
      this.store.dispatch(CartActions.addToCart({
        product: {
          ...this.product!,
          id: this.product!.id as any,
          selectedSize: this.selectedSize,
          quantity: 1
        }
      }));
    }

    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 3000);
  }

  get isComingSoon(): boolean {
    return this.product?.status === 'comingsoon';
  }

  get isOutOfStock(): boolean {
    return this.product?.status === 'outofstock';
  }

  get discount(): number {
    if (!this.product?.originalPrice || !this.product.price) return 0;
    return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
  }

  goBack(): void { this.router.navigate(['/products']); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}



