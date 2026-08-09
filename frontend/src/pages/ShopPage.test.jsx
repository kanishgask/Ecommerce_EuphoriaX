import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ShopPage from './ShopPage';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../services/api';

// Mock API
vi.mock('../services/api', () => {
  return {
    default: {
      get: vi.fn()
    }
  };
});

// Mock react-redux selectively to avoid slice import issues, 
// or we can just mock the specific selector. Let's mock react-redux fully to be safe.
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn((selector) => {
      // Mock the behavior of specific selectors if needed, or return default
      return []; // Return empty array for wishlistItems
    }),
    useDispatch: () => vi.fn()
  };
});

describe('ShopPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders loading state initially and then products', async () => {
    const mockProducts = [
      { id: 1, name: 'Test Product 1', price: 99, category: 'Electronics', rating: 4, reviews: 10, image: 'test.jpg' }
    ];
    
    api.get.mockResolvedValueOnce({ data: { data: mockProducts } });

    render(
      <MemoryRouter initialEntries={['/shop']}>
        <ShopPage />
      </MemoryRouter>
    );

    // Initial state check
    expect(screen.getByText(/Loading products.../i)).toBeInTheDocument();

    // Wait for the mocked API call to resolve and DOM to update
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledWith('/products');
  });
});
