import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { describe, it, expect, vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('HomePage', () => {
  it('renders hero section', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getAllByText(/Elevate/i)[0]).toBeInTheDocument();
  });
  
  it('renders shop collection button', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/Shop Collection/i)).toBeInTheDocument();
  });

  it('renders category sections', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/Explore Collections/i)).toBeInTheDocument();
  });

  it('renders newsletter subscription', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/Join the Exclusive Club/i)).toBeInTheDocument();
  });

  it('renders testimonials', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/Loved by Innovators/i)).toBeInTheDocument();
  });
});
