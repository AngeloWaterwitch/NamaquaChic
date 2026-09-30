import { CartItem } from './cart.reducer';
import { ProductState } from './product.reducer';

export interface AppState {
  cart: CartItem[];
  product: ProductState;
}

