import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/api';

// Mock Dependencies
vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn()
}));

vi.mock('../../services/api', () => ({
  authService: { login: vi.fn() }
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Login Page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({ login: mockLogin });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders correctly and defaults to USER login type', () => {
    renderComponent();
    expect(screen.getByText(/Sign in to Shop/i)).toBeDefined();
    expect(screen.getByPlaceholderText('customer@euphoria.com')).toBeDefined();
  });

  it('switches to ADMIN login type when Admin Portal tab is clicked', () => {
    renderComponent();
    const adminTab = screen.getByText('Admin Portal');
    fireEvent.click(adminTab);
    
    expect(screen.getByText(/Admin Executive Login/i)).toBeDefined();
    expect(screen.getByPlaceholderText('admin@euphoria.com')).toBeDefined();
  });



  it('submits form successfully and navigates to home', async () => {
    authService.login.mockResolvedValueOnce({ data: { data: { accessToken: 'token123' } } });
    
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('customer@euphoria.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByText('Sign In to Store');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' });
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('falls back to mock auth if API fails', async () => {
    authService.login.mockRejectedValueOnce(new Error('Network Error'));
    
    renderComponent();
    
    const emailInput = screen.getByPlaceholderText('customer@euphoria.com');
    const passInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByText('Sign In to Store');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled(); // Should still login via fallback
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});
