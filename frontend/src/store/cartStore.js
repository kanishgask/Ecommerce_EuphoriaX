import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartService } from '../services/api';
import { useAuthStore } from './authStore';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) return;
        
        set({ isLoading: true });
        try {
          const response = await cartService.getCart();
          const cart = response.data.data;
          set({ items: cart?.items || [] });
        } catch (error) {
          console.error('Failed to fetch cart', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (product, quantity = 1) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (isAuthenticated) {
          try {
            await cartService.addItem({ productId: product.productId, quantity });
            // Re-fetch to get accurate server state
            get().fetchCart();
            toast.success(`Added to cart!`);
          } catch (error) {
            toast.error('Failed to add item');
          }
        } else {
          // Local state for guests
          const { items } = get();
          const existingItem = items.find(i => i.productId === product.productId);
          
          if (existingItem) {
            set({
              items: items.map(i => 
                i.productId === product.productId 
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            });
          } else {
            set({ items: [...items, { ...product, quantity }] });
          }
          toast.success(`Added to cart!`);
        }
        set({ isOpen: true });
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity < 1) return get().removeItem(productId);
        
        const { isAuthenticated } = useAuthStore.getState();
        
        if (isAuthenticated) {
          try {
            await cartService.updateQuantity(productId, { quantity });
            get().fetchCart();
          } catch (error) {
            toast.error('Failed to update quantity');
          }
        } else {
          set((state) => ({
            items: state.items.map(i => i.productId === productId ? { ...i, quantity } : i)
          }));
        }
      },

      removeItem: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (isAuthenticated) {
          try {
            await cartService.removeItem(productId);
            get().fetchCart();
          } catch (error) {
            toast.error('Failed to remove item');
          }
        } else {
          set((state) => ({
            items: state.items.filter(i => i.productId !== productId)
          }));
        }
      },
      
      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            await cartService.clearCart();
            set({ items: [] });
          } catch (error) {
            toast.error('Failed to clear cart');
          }
        } else {
          set({ items: [] });
        }
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
