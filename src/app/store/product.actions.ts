import { createAction, props } from '@ngrx/store';
import { Product } from '../models/product.model';  // Adjust the path if needed

// Action to set the products in the store
export const setProducts = createAction(
  '[Product List] Set Products',
  props<{ products: Product[] }>()
);
