import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminInventory from './AdminInventory';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

window.alert = vi.fn();

describe('AdminInventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inventory management title', () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<AdminInventory />);
    expect(screen.getByText('Inventory Management')).toBeInTheDocument();
  });

  it('fetches and displays inventory', async () => {
    const mockProducts = [{ id: 'prod1', name: 'Product 1' }];
    const mockInventory = { availableStock: 15, reservedStock: 2, updatedAt: '2026-08-01T00:00:00Z' };
    
    api.get.mockImplementation((url) => {
      if (url === '/products') return Promise.resolve({ data: { data: mockProducts } });
      if (url === '/inventory/prod1') return Promise.resolve({ data: { inventory: mockInventory } });
      return Promise.reject(new Error('not found'));
    });
    
    render(<AdminInventory />);
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays low stock warning', async () => {
    const mockProducts = [{ id: 'prod1', name: 'Product 1' }];
    const mockInventory = { availableStock: 5, reservedStock: 0 };
    
    api.get.mockImplementation((url) => {
      if (url === '/products') return Promise.resolve({ data: { data: mockProducts } });
      if (url === '/inventory/prod1') return Promise.resolve({ data: { inventory: mockInventory } });
      return Promise.resolve({ data: {} });
    });
    
    render(<AdminInventory />);
    
    await waitFor(() => {
      expect(screen.getByText(/Warning: Some products have critically low stock/i)).toBeInTheDocument();
    });
  });

  it('handles stock edit', async () => {
    const mockProducts = [{ id: 'prod1', name: 'Product 1' }];
    const mockInventory = { availableStock: 15, reservedStock: 2 };
    
    api.get.mockImplementation((url) => {
      if (url === '/products') return Promise.resolve({ data: { data: mockProducts } });
      if (url === '/inventory/prod1') return Promise.resolve({ data: { inventory: mockInventory } });
      return Promise.resolve({ data: {} });
    });
    api.put.mockResolvedValueOnce({});
    
    render(<AdminInventory />);
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit Stock'));
    
    expect(screen.getByText('Update Stock')).toBeInTheDocument();
    
    const input = screen.getByDisplayValue('15');
    fireEvent.change(input, { target: { value: '20' } });
    
    fireEvent.click(screen.getByText('Update'));
    
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/inventory/prod1', { quantity: 20 });
    });
  });
});
