import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as CartActions from '../store/cart.actions';
import { CartItem } from '../store/cart.reducer';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartItems$: Observable<CartItem[]>;

  constructor(private store: Store<any>) {
    this.cartItems$ = this.store.select('cart') as Observable<CartItem[]>;
  }

  increase(id: number, selectedSize: string): void {
    this.store.dispatch(CartActions.increaseQuantity({ id, selectedSize }));
  }

  decrease(id: number, selectedSize: string): void {
    this.store.dispatch(CartActions.decreaseQuantity({ id, selectedSize }));
  }

  remove(id: number, selectedSize: string): void {
    this.store.dispatch(CartActions.removeFromCart({ id }));
  }

  getTotal(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }
}



