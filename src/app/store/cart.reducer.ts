import { createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string | string[];
  quantity: number;
  selectedSize: string;
}


export const initialState: CartItem[] = [];

export const cartReducer = createReducer(
  initialState,

on(CartActions.addToCart, (state, { product }) => {

  const existing = state.find(item =>
    item.id === product.id &&
    item.selectedSize === product.selectedSize
  );

  if (existing) {
    return state.map(item =>
      item.id === product.id && item.selectedSize === product.selectedSize
        ? { ...item, quantity: item.quantity + product.quantity }
        : item
    );
  }

  return [
    ...state,
    {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity,
      selectedSize: product.selectedSize
    }
  ];
}),


on(CartActions.increaseQuantity, (state, { id, selectedSize }) =>
  state.map(item =>
    item.id === id && item.selectedSize === selectedSize
      ? { ...item, quantity: item.quantity + 1 }
      : item
  )
),

on(CartActions.decreaseQuantity, (state, { id, selectedSize }) =>
  state
    .map(item =>
      item.id === id && item.selectedSize === selectedSize
        ? { ...item, quantity: item.quantity - 1 }
        : item
    )
    .filter(item => item.quantity > 0)
),

  on(CartActions.removeFromCart, (state, { id }) =>
    state.filter(item => item.id !== id)
  )
);

on(CartActions.clearCart, () => [])