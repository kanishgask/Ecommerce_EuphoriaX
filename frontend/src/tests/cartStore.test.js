import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

describe('Cart Store Unit Tests', () => {
  beforeEach(() => {
    // Reset auth and cart before each test
    useAuthStore.getState().logout();
    useCartStore.setState({ items: [], isOpen: false, isLoading: false });
  });

  it('should start with an empty cart', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getCartCount()).toBe(0);
    expect(state.getCartTotal()).toBe(0);
  });

  it('should add a new product to the cart in guest mode', async () => {
    const product = { productId: 'prod-1', name: 'Wireless Headphones', price: 99.99 };
    await useCartStore.getState().addItem(product, 2);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0]).toEqual({ ...product, quantity: 2 });
    expect(state.getCartCount()).toBe(2);
    expect(state.getCartTotal()).toBeCloseTo(199.98);
  });

  it('should increment quantity when adding an existing product', async () => {
    const product = { productId: 'prod-1', name: 'Wireless Headphones', price: 100 };
    await useCartStore.getState().addItem(product, 1);
    await useCartStore.getState().addItem(product, 3);

    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].quantity).toBe(4);
    expect(state.getCartCount()).toBe(4);
    expect(state.getCartTotal()).toBe(400);
  });

  it('should update item quantity correctly', async () => {
    const product = { productId: 'prod-2', name: 'Smart Watch', price: 150 };
    await useCartStore.getState().addItem(product, 1);
    
    await useCartStore.getState().updateQuantity('prod-2', 5);
    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.getCartTotal()).toBe(750);
  });

  it('should remove item when quantity is updated to 0 or negative', async () => {
    const product = { productId: 'prod-3', name: 'Bluetooth Speaker', price: 50 };
    await useCartStore.getState().addItem(product, 2);
    
    await useCartStore.getState().updateQuantity('prod-3', 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('should remove a specific item by productId', async () => {
    const prod1 = { productId: 'p1', name: 'Item 1', price: 10 };
    const prod2 = { productId: 'p2', name: 'Item 2', price: 20 };
    await useCartStore.getState().addItem(prod1, 1);
    await useCartStore.getState().addItem(prod2, 1);

    await useCartStore.getState().removeItem('p1');
    const state = useCartStore.getState();
    expect(state.items.length).toBe(1);
    expect(state.items[0].productId).toBe('p2');
    expect(state.getCartTotal()).toBe(20);
  });

  it('should clear the entire cart', async () => {
    await useCartStore.getState().addItem({ productId: 'p1', price: 10 }, 2);
    await useCartStore.getState().addItem({ productId: 'p2', price: 20 }, 3);

    await useCartStore.getState().clearCart();
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getCartCount()).toBe(0);
    expect(state.getCartTotal()).toBe(0);
  });
});
