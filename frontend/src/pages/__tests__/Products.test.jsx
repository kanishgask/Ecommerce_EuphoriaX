import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Products from '../Products';
import toast from 'react-hot-toast';
import { useCartStore } from '../../store/cartStore';
import { useProductStore } from '../../store/productStore';

vi.mock('../../store/cartStore', () => ({
  useCartStore: vi.fn()
}));

vi.mock('../../store/productStore', () => ({
  useProductStore: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}));

const mockProducts = [
  { productId: 'p1', name: 'Premium Watch', price: 299, category: 'Accessories', ratingAverage: 4.8 },
  { productId: 'p2', name: 'Running Shoes', price: 150, category: 'Footwear', ratingAverage: 4.5 }
];

describe('Products Page', () => {
  const mockAddItem = vi.fn();
  const mockFetchProducts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.mockReturnValue({ addItem: mockAddItem });
    useProductStore.mockReturnValue({ 
      products: mockProducts, 
      fetchProducts: mockFetchProducts,
      isLoading: false 
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Products />
      </BrowserRouter>
    );
  };

  it('renders products and sidebar filters', () => {
    renderComponent();
    expect(screen.getByText('Premium Watch')).toBeDefined();
    expect(screen.getByText('Running Shoes')).toBeDefined();
    expect(screen.getByText('Categories')).toBeDefined();
  });

  it('filters products by search query', async () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(searchInput, { target: { value: 'Watch' } });
    
    await waitFor(() => {
      expect(screen.getByText('Premium Watch')).toBeDefined();
      expect(screen.queryByText('Running Shoes')).toBeNull();
    });
  });

  it('adds item to cart on button click', () => {
    renderComponent();
    const addBtns = screen.getAllByText('Add to Cart');
    fireEvent.click(addBtns[0]); // Add first product

    expect(mockAddItem).toHaveBeenCalledWith(mockProducts[0], 1);
  });

  it('toggles wishlist icon', () => {
    const { container } = renderComponent();
    
    // Find the heart icon and click its parent button
    const heartSvg = container.querySelector('.lucide-heart');
    const wishlistBtn = heartSvg.closest('button');
    
    fireEvent.click(wishlistBtn);
    expect(toast.success).toHaveBeenCalledWith('Saved to Wishlist ❤️');
  });

  it('shows empty state when no products match filter', async () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(searchInput, { target: { value: 'NonexistentProduct123' } });
    
    await waitFor(() => {
      expect(screen.getByText('No items match your filters')).toBeDefined();
    });
    
    const resetBtn = screen.getByText('Reset Filters');
    fireEvent.click(resetBtn);
    
    await waitFor(() => {
      expect(searchInput.value).toBe('');
      expect(screen.getByText('Premium Watch')).toBeDefined();
    });
  });
});
