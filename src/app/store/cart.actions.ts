import { createAction, props } from '@ngrx/store';
import { Product } from '../models/product.model';

export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ product: Product }>()
);

export const removeFromCart = createAction(
  '[Cart] Remove From Cart',
  props<{ id: number }>()
);

export const increaseQuantity = createAction(
  '[Cart] Increase Quantity',
  props<{ id: number; selectedSize: string }>()
);

export const decreaseQuantity = createAction(
  '[Cart] Decrease Quantity',
  props<{ id: number; selectedSize: string }>()
);

export const clearCart = createAction('[Cart] Clear Cart');
