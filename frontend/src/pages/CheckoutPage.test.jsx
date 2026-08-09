import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ReactRedux from 'react-redux';
import CheckoutPage from './CheckoutPage';
import api from '../services/api';

// ─── framer-motion: prevent animation loops from hanging jsdom ────────────────
vi.mock('framer-motion', () => ({
  motion: {
    div:    ({ children, ...p }) => <div    {...p}>{children}</div>,
    button: ({ children, ...p }) => <button {...p}>{children}</button>,
    h2:     ({ children, ...p }) => <h2     {...p}>{children}</h2>,
    h3:     ({ children, ...p }) => <h3     {...p}>{children}</h3>,
    p:      ({ children, ...p }) => <p      {...p}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
}));

// ─── Router ───────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// ─── API ──────────────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  default: { post: vi.fn(), patch: vi.fn() },
}));

// ─── Redux: use vi.fn() so we can call mockImplementation in beforeEach ───────
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

// ─── Slices ───────────────────────────────────────────────────────────────────
vi.mock('../store/slices/paymentSlice', () => ({
  initiatePayment: vi.fn(() => ({ type: 'payment/initiate' })),
  verifyPayment: vi.fn(),
  resetPaymentState: vi.fn(),
}));

vi.mock('../store/slices/cartSlice', () => ({
  selectCartItems: vi.fn(),
  selectCartTotal: vi.fn(),
  clearCart: vi.fn(() => ({ type: 'cart/clear' })),
  syncClearCart: vi.fn(() => ({ type: 'cart/syncClear' })),
}));

// ─── Side-effect libs ─────────────────────────────────────────────────────────
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    setFontSize: vi.fn(), text: vi.fn(), save: vi.fn(), setTextColor: vi.fn(),
  })),
}));

// ─── Shared test data ─────────────────────────────────────────────────────────
const CART_ITEMS = [{ id: 1, name: 'Prod', price: 10, quantity: 1, images: [] }];
const CART_TOTAL = 10;

const makeMockDispatch = () =>
  vi.fn(() => ({ unwrap: () => Promise.resolve({ id: 'pay-abc' }) }));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const renderPage = () => render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

const fillShipping = () => {
  fireEvent.change(screen.getByLabelText(/First Name/i),     { target: { value: 'J' } });
  fireEvent.change(screen.getByLabelText(/Last Name/i),      { target: { value: 'D' } });
  fireEvent.change(screen.getByLabelText(/Street Address/i), { target: { value: 'A' } });
  fireEvent.change(screen.getByLabelText(/City/i),           { target: { value: 'C' } });
  fireEvent.change(screen.getByLabelText(/State/i),          { target: { value: 'S' } });
  fireEvent.change(screen.getByLabelText(/ZIP/i),            { target: { value: 'Z' } });
  fireEvent.change(screen.getByLabelText(/Phone Number/i),   { target: { value: 'P' } });
  fireEvent.click(screen.getByText(/Continue to Review/i));
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockResolvedValue({ data: { data: { id: 'order-123' } } });
    api.patch.mockResolvedValue({});

    // useSelector: 1st call per render → cartItems, 2nd call → cartTotal
    let selectorCount = 0;
    ReactRedux.useSelector.mockImplementation(() => {
      selectorCount++;
      return selectorCount % 2 === 1 ? CART_ITEMS : CART_TOTAL;
    });

    const mockDispatch = makeMockDispatch();
    ReactRedux.useDispatch.mockReturnValue(mockDispatch);
  });

  it('renders checkout page with steps', () => {
    renderPage();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
  });

  it('shows all 4 step indicators', () => {
    renderPage();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
  });

  it('progresses to review step on submit shipping', async () => {
    renderPage();
    fillShipping();
    await waitFor(() => expect(screen.getByText('Review Your Order')).toBeInTheDocument());
  });

  it('can go back to shipping from review', async () => {
    renderPage();
    fillShipping();
    await waitFor(() => screen.getByText('Review Your Order'));
    fireEvent.click(screen.getByText('Back'));
    await waitFor(() => expect(screen.getByText('Shipping Address')).toBeInTheDocument());
  });

  it('progresses from review to payment', async () => {
    renderPage();
    fillShipping();
    await waitFor(() => screen.getByText('Review Your Order'));
    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    await waitFor(() => expect(screen.getByText('Payment Gateway')).toBeInTheDocument());
  });

  it('renders UPI payment options by default', async () => {
    renderPage();
    fillShipping();
    await waitFor(() => screen.getByText('Review Your Order'));
    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    await waitFor(() => screen.getByText('Payment Gateway'));
    expect(screen.getByText('UPI App')).toBeInTheDocument();
  });

  it('can switch to COD payment method', async () => {
    renderPage();
    fillShipping();
    await waitFor(() => screen.getByText('Review Your Order'));
    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    await waitFor(() => screen.getByText('Payment Gateway'));
    fireEvent.click(screen.getByText('Cash'));
    expect(screen.getByText('Confirm Order')).toBeInTheDocument();
  });

  it('submits COD order and calls api.post', async () => {
    renderPage();
    fillShipping();
    await waitFor(() => screen.getByText('Review Your Order'));
    fireEvent.click(screen.getByText(/Proceed to Payment/i));
    await waitFor(() => screen.getByText('Payment Gateway'));
    fireEvent.click(screen.getByText('Cash'));
    fireEvent.click(screen.getByText('Confirm Order'));
    // simulateLoadingSequence = 4 × 800ms real time; give it 10 s
    await waitFor(() => expect(api.post).toHaveBeenCalled(), { timeout: 10000 });
  }, 15000);
});
