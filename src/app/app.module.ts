import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule }        from './app-routing.module';
import { AppComponent }            from './app.component';
import { HomeComponent }           from './home/home.component';
import { AboutComponent }          from './about/about.component';
import { ServicesComponent }       from './services/services.component';
import { ContactComponent }        from './contact/contact.component';
import { BlogComponent }           from './blog/blog.component';
import { ProductListComponent }    from './product-list/product-list.component';
import { AdminComponent }          from './admin/admin.component';
import { PrivacyPolicyComponent }  from './legal/privacy-policy.component';
import { TermsComponent }          from './legal/terms.component';
import { SizingGuideComponent }    from './info-pages/sizing-guide.component';
import { FaqsComponent }           from './info-pages/faqs.component';
import { ShippingComponent }       from './info-pages/shipping.component';
import { SafePipe }                from './pipes/safe.pipe';
import { CartComponent }           from './cart/cart.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CheckoutComponent }       from './checkout/checkout.component';
import { ImageUploadComponent }    from './image-upload/image-upload.component';
import { productReducer }          from './store/product.reducer';
import { cartReducer }             from './store/cart.reducer';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ServicesComponent,
    ContactComponent,
    BlogComponent,
    ProductListComponent,
    AdminComponent,
    SafePipe,
    PrivacyPolicyComponent,
    TermsComponent,
    SizingGuideComponent,
    FaqsComponent,
    ShippingComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CartComponent,
    ProductDetailsComponent,
    CheckoutComponent,
    ImageUploadComponent,
    StoreModule.forRoot({ cart: cartReducer, product: productReducer }),
    AppRoutingModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {}
