import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminOrders from './AdminOrders';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn()
  }
}));

window.confirm = vi.fn(() => true);

describe('AdminOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders orders title and loading state', () => {
    api.get.mockResolvedValueOnce({ data: [] });
    render(<AdminOrders />);
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText(/Loading spinner/i)).toBeInTheDocument();
  });

  it('fetches and displays orders', async () => {
    const mockOrders = [
      { id: 'order1', userId: 'user1', items: [{}], totalAmount: 100, status: 'PENDING', createdAt: '2026-08-01T00:00:00Z' },
      { id: 'order2', userId: 'user2', items: [{}, {}], totalAmount: 200, status: 'CONFIRMED', createdAt: '2026-08-02T00:00:00Z' }
    ];
    api.get.mockResolvedValueOnce({ data: { data: mockOrders } });
    
    render(<AdminOrders />);
    
    await waitFor(() => {
      expect(screen.getByText('order1...')).toBeInTheDocument();
    });

    expect(screen.getByText('$300.00')).toBeInTheDocument(); // total revenue
  });

  it('filters orders by status', async () => {
    const mockOrders = [
      { id: 'order1', userId: 'user1', items: [], totalAmount: 100, status: 'PENDING' },
      { id: 'order2', userId: 'user2', items: [], totalAmount: 200, status: 'CONFIRMED' }
    ];
    api.get.mockResolvedValueOnce({ data: { data: mockOrders } });
    
    render(<AdminOrders />);
    
    await waitFor(() => {
      expect(screen.getByText('order1...')).toBeInTheDocument();
    });

    const confirmedBtn = screen.getAllByText('CONFIRMED')[0];
    fireEvent.click(confirmedBtn);

    expect(screen.queryByText('order1...')).not.toBeInTheDocument();
    expect(screen.getByText('order2...')).toBeInTheDocument();
  });

  it('handles order status update', async () => {
    const mockOrders = [
      { id: 'order1', userId: 'user1', items: [], totalAmount: 100, status: 'PENDING' }
    ];
    api.get.mockResolvedValueOnce({ data: { data: mockOrders } });
    api.patch.mockResolvedValueOnce({ data: { success: true } });
    api.get.mockResolvedValueOnce({ data: { data: [{...mockOrders[0], status: 'CONFIRMED'}] } }); // for refetch
    
    render(<AdminOrders />);
    
    await waitFor(() => {
      expect(screen.getByText('order1...')).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue('PENDING');
    fireEvent.change(select, { target: { value: 'CONFIRMED' } });

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/orders/order1/status', { status: 'CONFIRMED' });
    });
  });
});
