import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './services/services.component';
import { ContactComponent } from './contact/contact.component';
import { BlogComponent } from './blog/blog.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy.component';
import { TermsComponent } from './legal/terms.component';
import { SizingGuideComponent } from './info-pages/sizing-guide.component';
import { FaqsComponent } from './info-pages/faqs.component';
import { ShippingComponent } from './info-pages/shipping.component';
import { AdminComponent } from './admin/admin.component';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '',                component: HomeComponent },
  { path: 'home',            component: HomeComponent },
  { path: 'products',        component: ProductListComponent },
  { path: 'product-details/:id', component: ProductDetailsComponent },
  { path: 'about',           component: AboutComponent },
  { path: 'services',        component: ServicesComponent },
  { path: 'contact',         component: ContactComponent },
  { path: 'blog',            component: BlogComponent },
  { path: 'cart',            component: CartComponent },
  { path: 'checkout',        component: CheckoutComponent },
  { path: 'privacy-policy',  component: PrivacyPolicyComponent },
  { path: 'terms',           component: TermsComponent },
  { path: 'sizing-guide',    component: SizingGuideComponent },
  { path: 'faqs',            component: FaqsComponent },
  { path: 'shipping',        component: ShippingComponent },
  { path: 'admin',           component: AdminComponent, canActivate: [AdminGuard] },
  { path: '**',              redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}