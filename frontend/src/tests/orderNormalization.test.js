import { describe, it, expect, beforeEach } from 'vitest';

// Replicate normalizeOrder logic used in AdminOrders.jsx
const normalizeOrder = (o, idx) => {
  const statusOverrides = JSON.parse(localStorage.getItem('euphoriax_order_statuses') || '{}');
  const id = String(o.orderId || o.id || o._id || `#ORD-${8000 + idx}`);
  const cleanId = id.replace('#', '');
  const status = statusOverrides[id] || statusOverrides[cleanId] || statusOverrides[`#${cleanId}`] || String(o.status || 'Pending');
  return {
    id,
    customer: String(o.shippingAddress?.firstName ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName || ''}` : (o.customer || 'Customer')),
    email: String(o.userId ? `user_${String(o.userId).slice(-4)}@euphoria.com` : (o.email || 'guest@euphoria.com')),
    date: String(o.createdAt ? new Date(o.createdAt).toLocaleDateString() : (o.date || 'Today')),
    items: Array.isArray(o.items) ? o.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : (typeof o.items === 'object' ? 1 : Number(o.items || 1)),
    total: typeof o.totalAmount === 'number' ? `$${o.totalAmount.toFixed(2)}` : String(o.total || '$99.00'),
    status,
    version: Number(o.version || 1),
  };
};

// Replicate normalizeUserOrder logic used in UserOrders.jsx
const normalizeUserOrder = (o, idx) => {
  const statusOverrides = JSON.parse(localStorage.getItem('euphoriax_order_statuses') || '{}');
  const id = String(o.orderId || o.id || o._id || `EX-${800000 + idx}`);
  const cleanId = id.replace('#', '');
  
  const rawStatus = statusOverrides[id] || statusOverrides[cleanId] || statusOverrides[`#${cleanId}`] || o.status || 'PROCESSING';
  const status = String(rawStatus).toUpperCase();
  
  const step = status === 'DELIVERED' ? 4 : status === 'SHIPPED' ? 3 : status === 'PROCESSING' ? 2 : 1;
  
  let estimatedDelivery = o.estimatedDelivery || 'In Transit';
  if (status === 'DELIVERED') {
    estimatedDelivery = 'Order Shipped & Delivered Successfully';
  } else if (status === 'SHIPPED') {
    estimatedDelivery = 'Order Shipped - In Transit to Destination';
  } else if (status === 'PROCESSING') {
    estimatedDelivery = 'Order Processing at Fulfillment Warehouse';
  }

  return {
    id,
    status,
    step,
    estimatedDelivery
  };
};

describe('Order Normalization & Real-Time Status Override Sync Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should convert local storage cart item array into total item count integer', () => {
    const rawLocalOrder = {
      id: '#ORD-LOCAL-1',
      customer: 'Emma Watson',
      email: 'emma@example.com',
      date: '2026-07-26',
      total: '$299.00',
      status: 'Processing',
      items: [
        { productId: 'p1', name: 'Shoes', quantity: 2 },
        { productId: 'p2', name: 'Hat', quantity: 3 }
      ]
    };

    const normalized = normalizeOrder(rawLocalOrder, 0);
    expect(typeof normalized.items).toBe('number');
    expect(normalized.items).toBe(5); // 2 + 3
    expect(typeof normalized.id).toBe('string');
    expect(typeof normalized.customer).toBe('string');
  });

  it('should reflect admin status overrides from localStorage into both Admin and User order objects', () => {
    // Admin sets status of order EX-892410 to DELIVERED in localStorage
    const overrides = { 'EX-892410': 'DELIVERED' };
    localStorage.setItem('euphoriax_order_statuses', JSON.stringify(overrides));

    const rawOrder = {
      id: 'EX-892410',
      status: 'Processing',
      estimatedDelivery: 'Express 2-Day Delivery'
    };

    const adminNormalized = normalizeOrder(rawOrder, 0);
    expect(adminNormalized.status).toBe('DELIVERED');

    const userNormalized = normalizeUserOrder(rawOrder, 0);
    expect(userNormalized.status).toBe('DELIVERED');
    expect(userNormalized.step).toBe(4);
    expect(userNormalized.estimatedDelivery).toBe('Order Shipped & Delivered Successfully');
  });

  it('should update tracking step and fulfillment messaging when status changes to SHIPPED', () => {
    const overrides = { 'ORD-999': 'SHIPPED' };
    localStorage.setItem('euphoriax_order_statuses', JSON.stringify(overrides));

    const userNormalized = normalizeUserOrder({ id: 'ORD-999', status: 'Pending' }, 1);
    expect(userNormalized.status).toBe('SHIPPED');
    expect(userNormalized.step).toBe(3);
    expect(userNormalized.estimatedDelivery).toBe('Order Shipped - In Transit to Destination');
  });

  it('should handle numeric item count from database API without altering value', () => {
    const apiOrder = {
      orderId: 9001,
      customer: 'James Bond',
      email: '007@mi6.gov',
      date: 'Today',
      totalAmount: 1500.50,
      status: 'Delivered',
      items: 4
    };

    const normalized = normalizeOrder(apiOrder, 1);
    expect(normalized.id).toBe('9001');
    expect(normalized.items).toBe(4);
    expect(normalized.total).toBe('$1500.50');
  });
});
