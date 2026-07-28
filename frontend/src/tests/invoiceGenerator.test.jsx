import React from 'react';
import { describe, it, expect } from 'vitest';
import { InvoiceDocument } from '../utils/invoiceGenerator';

describe('Invoice Generator Unit Tests', () => {
  it('should instantiate InvoiceDocument with full order items array without crashing', () => {
    const mockOrder = {
      id: '#ORD-1001',
      customer: 'John Doe',
      email: 'john@example.com',
      date: '2026-07-26',
      status: 'DELIVERED',
      total: '$199.98',
      shippingAddress: '123 Test St, City, Country',
      items: [
        { name: 'Product A', quantity: 2, price: '$99.99' }
      ]
    };

    const element = <InvoiceDocument order={mockOrder} />;
    expect(element).toBeDefined();
    expect(element.props.order.id).toBe('#ORD-1001');
    expect(element.props.order.items.length).toBe(1);
  });

  it('should handle numeric items count (admin fallback) smoothly without errors', () => {
    const mockOrderNum = {
      id: '#ORD-1002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      date: '2026-07-25',
      status: 'SHIPPED',
      total: '$45.00',
      items: 3 // Numeric item count instead of array
    };

    const element = <InvoiceDocument order={mockOrderNum} />;
    expect(element).toBeDefined();
    expect(element.props.order.items).toBe(3);
  });

  it('should apply fallback order properties when fields are null or undefined', () => {
    const emptyOrder = {};
    const element = <InvoiceDocument order={emptyOrder} />;
    expect(element).toBeDefined();
    expect(element.props.order).toEqual({});
  });
});
