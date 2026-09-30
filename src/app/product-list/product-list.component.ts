import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { addToCart } from '../store/cart.actions';
import { Subscription } from 'rxjs';
import { ProductService, Product } from '../services/product.service';
import { SeoService } from '../services/seo.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  allProducts: Product[] = [];
  filtered: Product[] = [];

  searchQuery = '';
  selectedCategory = '';
  selectedSize = '';
  selectedColor = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy = 'newest';

  categories: string[] = [];
  sizes: string[] = ['XS','S','M','L','XL','XXL'];
  colors: string[] = [];

  addedId: string | null = null;
  private sub!: Subscription;

  constructor(
    private productSvc: ProductService,
    private store: Store<any>,
    private router: Router,
    private seoSvc: SeoService
  ) {}

  goToProduct(id: string | undefined): void {
    if (id) this.router.navigate(['/product-details', id]);
  }

  ngOnInit(): void {
    this.seoSvc.set({ title: 'Shop', description: 'Browse the full NamakwaChic collection. Earthy, elegant fashion inspired by the Namakwa desert.' });
    this.sub = this.productSvc.getAll().subscribe(products => {
      this.allProducts = products.filter(p => p.published !== false);
      this.categories = [...new Set(products.map(p => p.category).filter(Boolean))];
      this.colors = [...new Set(products.flatMap(p => p.colours || []).filter(Boolean))];
      this.applyFilters();
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  applyFilters(): void {
    let result = [...this.allProducts];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (this.selectedCategory) result = result.filter(p => p.category === this.selectedCategory);
    if (this.selectedSize)     result = result.filter(p => p.sizes?.includes(this.selectedSize));
    if (this.selectedColor)    result = result.filter(p => p.colours?.includes(this.selectedColor));
    if (this.minPrice != null) result = result.filter(p => p.price >= this.minPrice!);
    if (this.maxPrice != null) result = result.filter(p => p.price <= this.maxPrice!);

    if (this.sortBy === 'price-asc')  result.sort((a,b) => a.price - b.price);
    if (this.sortBy === 'price-desc') result.sort((a,b) => b.price - a.price);
    if (this.sortBy === 'name')       result.sort((a,b) => a.name.localeCompare(b.name));

    this.filtered = result;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedSize = '';
    this.selectedColor = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'newest';
    this.applyFilters();
  }

  addToCart(product: Product, size?: string): void {
    this.store.dispatch(addToCart({
      product: {
        id: parseInt(product.id ?? '0'),
        name: product.name,
        description: product.description || '',
        price: product.price,
        image: product.image || '',
        quantity: 1,
        selectedSize: size || (product.sizes?.[0] ?? '')
      }
    }));
    this.addedId = product.id ?? null;
    setTimeout(() => this.addedId = null, 2000);
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchQuery || this.selectedCategory || this.selectedSize || this.selectedColor || this.minPrice || this.maxPrice);
  }
}


