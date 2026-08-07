import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  items: [],
  isDrawerOpen: false,
};

// Async Thunks to sync with Backend Cart Service
export const syncAddItem = createAsyncThunk('cart/syncAddItem', async ({ productId, quantity }) => {
  await api.post('/cart/items', { productId, quantity });
});

export const syncUpdateQuantity = createAsyncThunk('cart/syncUpdateQuantity', async ({ productId, quantity }) => {
  await api.put(`/cart/items/${productId}`, { quantity });
});

export const syncRemoveItem = createAsyncThunk('cart/syncRemoveItem', async (productId) => {
  await api.delete(`/cart/items/${productId}`);
});

export const syncClearCart = createAsyncThunk('cart/syncClearCart', async () => {
  await api.delete('/cart');
});

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
      state.isDrawerOpen = true; // Auto open drawer on add
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    setDrawerOpen: (state, action) => {
      state.isDrawerOpen = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, toggleDrawer, setDrawerOpen, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
export const selectCartItemsCount = (state) => state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;
