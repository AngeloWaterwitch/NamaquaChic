import { Injectable } from '@angular/core';

// ─────────────────────────────────────────────────────────
//  EMAILJS CONFIGURATION
//  Replace these values with your own from emailjs.com
//  Dashboard → Account → API Keys
// ─────────────────────────────────────────────────────────
export const EMAILJS_CONFIG = {
  publicKey:  'YOUR_PUBLIC_KEY',        // Account → API Keys → Public Key
  serviceId:  'YOUR_SERVICE_ID',        // Email Services → your service ID

  // Template IDs — create one template per email type
  templates: {
    orderConfirmation: 'YOUR_ORDER_CONFIRM_TEMPLATE_ID',  // to customer
    orderAlert:        'YOUR_ORDER_ALERT_TEMPLATE_ID',    // to admin
    contactForm:       'YOUR_CONTACT_FORM_TEMPLATE_ID',   // to admin
    newsletterWelcome: 'YOUR_NEWSLETTER_WELCOME_TEMPLATE_ID', // to subscriber
  },

  // Your email address — receives contact form + order alert emails
  adminEmail: 'your@email.com',
};

// ─────────────────────────────────────────────────────────
//  EMAILJS TEMPLATE VARIABLE REFERENCE
//
//  Order Confirmation (to customer):
//    {{to_name}}         — customer first name
//    {{to_email}}        — customer email
//    {{order_number}}    — e.g. NC-260314-4821
//    {{order_items}}     — list of items (name, size, qty, price)
//    {{order_subtotal}}  — e.g. R450.00
//    {{order_delivery}}  — e.g. R99.00 or FREE
//    {{order_discount}}  — e.g. R0.00
//    {{order_total}}     — e.g. R549.00
//    {{payment_method}}  — Cash on Delivery / PayFast
//    {{delivery_address}}— full address string
//
//  Order Alert (to admin):
//    {{order_number}}, {{customer_name}}, {{customer_email}}
//    {{customer_phone}}, {{order_total}}, {{payment_method}}
//    {{order_items}}, {{delivery_address}}
//
//  Contact Form (to admin):
//    {{from_name}}, {{from_email}}, {{subject}}, {{message}}
//
//  Newsletter Welcome (to subscriber):
//    {{to_email}}
// ─────────────────────────────────────────────────────────

export interface EmailPayload {
  [key: string]: string | number;
}

@Injectable({ providedIn: 'root' })
export class EmailService {

  private initialized = false;

  private init(): void {
    if (this.initialized) return;
    // Load EmailJS SDK dynamically — no npm install needed
    if (typeof (window as any).emailjs === 'undefined') {
      console.warn('EmailJS SDK not loaded. Add the script tag to index.html.');
      return;
    }
    (window as any).emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    this.initialized = true;
  }

  private async send(templateId: string, params: EmailPayload): Promise<void> {
    this.init();
    const ejs = (window as any).emailjs;
    if (!ejs) throw new Error('EmailJS not available');
    await ejs.send(EMAILJS_CONFIG.serviceId, templateId, params);
  }

  // ── Order Confirmation → customer ──
  async sendOrderConfirmation(order: {
    firstName: string;
    email: string;
    orderNumber: string;
    items: { name: string; selectedSize: string; quantity: number; price: number }[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
    address: string; suburb: string; city: string; province: string; postalCode: string;
  }): Promise<void> {
    const itemsList = order.items
      .map(i => `${i.name}${i.selectedSize ? ' (' + i.selectedSize + ')' : ''} × ${i.quantity} — R${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const deliveryAddress = [order.address, order.suburb, order.city, order.province, order.postalCode]
      .filter(Boolean).join(', ');

    await this.send(EMAILJS_CONFIG.templates.orderConfirmation, {
      to_name:          order.firstName,
      to_email:         order.email,
      order_number:     order.orderNumber,
      order_items:      itemsList,
      order_subtotal:   `R${order.subtotal.toFixed(2)}`,
      order_delivery:   order.deliveryFee === 0 ? 'FREE' : `R${order.deliveryFee.toFixed(2)}`,
      order_discount:   order.discount > 0 ? `-R${order.discount.toFixed(2)}` : 'None',
      order_total:      `R${order.total.toFixed(2)}`,
      payment_method:   order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'PayFast',
      delivery_address: deliveryAddress,
    });
  }

  // ── Order Alert → admin ──
  async sendOrderAlert(order: {
    firstName: string; lastName: string;
    email: string; phone: string;
    orderNumber: string;
    items: { name: string; selectedSize: string; quantity: number; price: number }[];
    total: number;
    paymentMethod: string;
    address: string; suburb: string; city: string; province: string; postalCode: string;
  }): Promise<void> {
    const itemsList = order.items
      .map(i => `${i.name}${i.selectedSize ? ' (' + i.selectedSize + ')' : ''} × ${i.quantity} — R${(i.price * i.quantity).toFixed(2)}`)
      .join('\n');

    const deliveryAddress = [order.address, order.suburb, order.city, order.province, order.postalCode]
      .filter(Boolean).join(', ');

    await this.send(EMAILJS_CONFIG.templates.orderAlert, {
      to_email:         EMAILJS_CONFIG.adminEmail,
      order_number:     order.orderNumber,
      customer_name:    `${order.firstName} ${order.lastName}`,
      customer_email:   order.email,
      customer_phone:   order.phone,
      order_total:      `R${order.total.toFixed(2)}`,
      payment_method:   order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'PayFast',
      order_items:      itemsList,
      delivery_address: deliveryAddress,
    });
  }

  // ── Contact Form → admin ──
  async sendContactForm(data: {
    name: string; email: string; subject: string; message: string;
  }): Promise<void> {
    await this.send(EMAILJS_CONFIG.templates.contactForm, {
      to_email:   EMAILJS_CONFIG.adminEmail,
      from_name:  data.name,
      from_email: data.email,
      subject:    data.subject,
      message:    data.message,
    });
  }

  // ── Newsletter Welcome → subscriber ──
  async sendNewsletterWelcome(email: string): Promise<void> {
    await this.send(EMAILJS_CONFIG.templates.newsletterWelcome, {
      to_email: email,
    });
  }
}