import { createReducer, on } from '@ngrx/store';
import { setProducts } from './product.actions';
import { Product } from '../models/product.model';  // Adjust the path if needed

// Define the initial state for products
export interface ProductState {
  products: Product[];
}


export const initialState: ProductState = {
  products: [],
};

// Reducer function to update product state
export const productReducer = createReducer(
  initialState,
  on(setProducts, (state, { products }) => ({ ...state, products }))
);
