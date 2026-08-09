import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CartPage from './CartPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }) => <a href={to}>{children}</a>
  };
});

let mockCartItems = [];
let mockCartTotal = 0;
const mockDispatch = vi.fn();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn((selector) => {
      if (selector.name === 'selectCartItems') return mockCartItems;
      if (selector.name === 'selectCartTotal') return mockCartTotal;
      return [];
    }),
    useDispatch: () => mockDispatch,
  };
});

describe('CartPage', () => {
  beforeEach(() => {
    mockCartItems = [];
    mockCartTotal = 0;
    vi.clearAllMocks();
  });

  it('renders empty cart state', () => {
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    expect(screen.getByText(/Your Cart is Empty/i)).toBeInTheDocument();
  });

  it('renders continue shopping button on empty cart', () => {
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    const button = screen.getByText(/Continue Shopping/i);
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith('/shop');
  });

  it('renders cart items when populated', () => {
    mockCartItems = [{ id: 1, name: 'Test Product', price: 100, quantity: 2, image: 'img.jpg', category: 'Tech' }];
    mockCartTotal = 200;
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getAllByText('$200.00')[0]).toBeInTheDocument();
  });

  it('calculates totals correctly including tax and shipping', () => {
    mockCartItems = [{ id: 1, name: 'Test Product', price: 100, quantity: 2 }];
    mockCartTotal = 200;
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    
    expect(screen.getByText('$231.00')).toBeInTheDocument();
  });

  it('shows order summary', () => {
    mockCartItems = [{ id: 1, name: 'Test Product', price: 100, quantity: 1 }];
    mockCartTotal = 100;
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
  });

  it('renders shopping cart title', () => {
    mockCartItems = [{ id: 1, name: 'Test Product', price: 100, quantity: 1 }];
    render(<MemoryRouter><CartPage /></MemoryRouter>);
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });
});
