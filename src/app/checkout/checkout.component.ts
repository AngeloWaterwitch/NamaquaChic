import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CartItem } from '../store/cart.reducer';
import { clearCart } from '../store/cart.actions';
import { OrderService, Order, PaymentMethod } from '../services/order.service';
import { EmailService } from '../services/email.service';
import { environment } from '../environments/environment';

// South African provinces
const SA_PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
];

// Simple promo codes — in production these would come from your database
const PROMO_CODES: Record<string, number> = {
  'NAMAKWA10': 10,
  'WELCOME15': 15,
  'NEWSEASON': 20
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit, OnDestroy {

  step: 1 | 2 | 3 = 1; // 1=Details, 2=Review, 3=Confirmation
  cartItems: CartItem[] = [];
  provinces = SA_PROVINCES;

  // Form fields
  form = {
    firstName: '', lastName: '',
    email: '', phone: '',
    address: '', suburb: '',
    city: '', province: '', postalCode: '',
    notes: ''
  };

  paymentMethod: PaymentMethod = 'cod';

  // Promo code
  promoInput = '';
  promoApplied = '';
  promoDiscount = 0;
  promoError = '';
  promoLoading = false;

  // Order state
  submitting = false;
  submitError = '';
  orderId = '';
  orderNumber = '';

  // Validation errors
  errors: Record<string, string> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<any>,
    private router: Router,
    private orderSvc: OrderService,
    private emailSvc: EmailService
  ) {}

  ngOnInit(): void {
    this.store.select('cart').pipe(takeUntil(this.destroy$)).subscribe((items: CartItem[]) => {
      this.cartItems = items;
      // Redirect to cart if empty
      if (items.length === 0 && this.step !== 3) {
        this.router.navigate(['/cart']);
      }
    });
  }

  // ── Totals ──
  get subtotal(): number {
    return this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get deliveryFee(): number {
    return this.subtotal >= 800 ? 0 : 99;
  }

  get discountAmount(): number {
    return this.promoDiscount > 0 ? Math.round(this.subtotal * (this.promoDiscount / 100)) : 0;
  }

  get total(): number {
    return this.subtotal + this.deliveryFee - this.discountAmount;
  }

  // ── Promo Code ──
  applyPromo(): void {
    this.promoError = '';
    const code = this.promoInput.trim().toUpperCase();
    if (!code) return;
    this.promoLoading = true;
    setTimeout(() => {
      if (PROMO_CODES[code]) {
        this.promoApplied = code;
        this.promoDiscount = PROMO_CODES[code];
        this.promoError = '';
      } else {
        this.promoError = 'Invalid promo code. Please try again.';
        this.promoApplied = '';
        this.promoDiscount = 0;
      }
      this.promoLoading = false;
    }, 600);
  }

  removePromo(): void {
    this.promoApplied = '';
    this.promoDiscount = 0;
    this.promoInput = '';
    this.promoError = '';
  }

  // ── Validation ──
  validate(): boolean {
    this.errors = {};
    if (!this.form.firstName.trim())  this.errors['firstName'] = 'Required';
    if (!this.form.lastName.trim())   this.errors['lastName']  = 'Required';
    if (!this.form.email.trim() || !this.form.email.includes('@')) this.errors['email'] = 'Valid email required';
    if (!this.form.phone.trim() || this.form.phone.trim().length < 9) this.errors['phone'] = 'Valid phone required';
    if (!this.form.address.trim())    this.errors['address']   = 'Required';
    if (!this.form.city.trim())       this.errors['city']      = 'Required';
    if (!this.form.province)          this.errors['province']  = 'Required';
    if (!this.form.postalCode.trim()) this.errors['postalCode']= 'Required';
    return Object.keys(this.errors).length === 0;
  }

  // ── Step navigation ──
  goToReview(): void {
    if (!this.validate()) {
      // Scroll to first error
      setTimeout(() => document.querySelector('.co-field--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }
    this.step = 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToDetails(): void {
    this.step = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Place Order ──
  async placeOrder(): Promise<void> {
    if (this.submitting) return;
    this.submitting = true;
    this.submitError = '';

    try {
      const order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
        firstName: this.form.firstName,
        lastName: this.form.lastName,
        email: this.form.email,
        phone: this.form.phone,
        address: this.form.address,
        suburb: this.form.suburb,
        city: this.form.city,
        province: this.form.province,
        postalCode: this.form.postalCode,
        notes: this.form.notes,
        items: this.cartItems.map(i => ({
          name: i.name, price: i.price,
          quantity: i.quantity, selectedSize: i.selectedSize,
          image: typeof i.image === 'string' ? i.image : ''
        })),
        subtotal: this.subtotal,
        deliveryFee: this.deliveryFee,
        discount: this.discountAmount,
        total: this.total,
        promoCode: this.promoApplied || undefined,
        paymentMethod: this.paymentMethod,
        paymentStatus: 'pending',
        status: 'pending'
      };

      const savedOrder = await this.orderSvc.place(order).toPromise();
      this.orderId = savedOrder?._id || savedOrder?.id || '';

      // Human-readable order number: date tag + last 4 chars of the real saved
      // order's Mongo _id, so it's actually traceable back to the DB record —
      // not just a random string with no connection to the order it names.
      const dateTag = `${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}`;
      const idTag = (this.orderId || '').slice(-4).toUpperCase() || Date.now().toString().slice(-4);
      this.orderNumber = savedOrder?.orderNumber || `NC-${dateTag}-${idTag}`;

      // Send emails — fire and forget (don't block the UX if email fails)
      const emailOrder = {
        ...this.form,
        orderNumber: this.orderNumber,
        items: order.items,
        subtotal: this.subtotal,
        deliveryFee: this.deliveryFee,
        discount: this.discountAmount,
        total: this.total,
        paymentMethod: this.paymentMethod,
      };
      this.emailSvc.sendOrderConfirmation(emailOrder).catch(e => console.warn('Order confirm email failed:', e));
      this.emailSvc.sendOrderAlert({ ...emailOrder, lastName: this.form.lastName, phone: this.form.phone }).catch(e => console.warn('Order alert email failed:', e));

      if (this.paymentMethod === 'payfast') {
        // Clear cart first, then redirect to PayFast
        this.store.dispatch(clearCart());
        this.submitPayFast();
      } else {
        // COD — clear cart and go to confirmation
        this.store.dispatch(clearCart());
        this.step = 3;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) {
      console.error(e);
      this.submitError = 'Something went wrong saving your order. Please try again.';
    } finally {
      this.submitting = false;
    }
  }

  // ── PayFast Integration ──
  submitPayFast(): void {
    // PayFast sandbox merchant details — replace with live credentials in production
    const MERCHANT_ID   = '10000100';   // ← Replace with your PayFast Merchant ID
    const MERCHANT_KEY  = '46f0cd694581a'; // ← Replace with your PayFast Merchant Key
    const PAYFAST_URL   = 'https://sandbox.payfast.co.za/eng/process'; // ← Change to https://www.payfast.co.za/eng/process for live

    const params: Record<string, string> = {
      merchant_id:    MERCHANT_ID,
      merchant_key:   MERCHANT_KEY,
      return_url:     `${window.location.origin}/checkout/complete?order=${this.orderId}`,
      cancel_url:     `${window.location.origin}/cart`,
      notify_url:     `${environment.apiUrl}/orders/${this.orderId}/payment`, // real backend webhook route
      name_first:     this.form.firstName,
      name_last:      this.form.lastName,
      email_address:  this.form.email,
      m_payment_id:   this.orderId,
      amount:         this.total.toFixed(2),
      item_name:      `NamakwaChic Order`,
      item_description: `${this.cartItems.length} item(s)`,
      email_confirmation: '1',
      confirmation_address: this.form.email
    };

    // Build and auto-submit a hidden form to PayFast
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYFAST_URL;
    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}