import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.get('/orders/all');
      } catch (e) {
        res = await api.get('/orders');
      }
      const data = Array.isArray(res.data?.data) ? res.data.data :
                   Array.isArray(res.data) ? res.data : 
                   (res.data?.data?.orders || res.data?.orders || []);
      setOrders(data);
    } catch (err) {
      console.error(err);
      window.alert('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  
  const filteredOrders = orders.filter(o => filterStatus === 'All' || o.status === filterStatus);

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <div style={{ padding: 24, background: '#0d1117', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>Orders</h1>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#9ca3af' }}>Total Revenue:</span>
            <span style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 18 }}>${totalRevenue.toFixed(2)}</span>
          </div>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#9ca3af' }}>Total Orders:</span>
            <span style={{ color: '#06b6d4', fontWeight: 'bold', fontSize: 18 }}>{orders.length}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['All', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(status => (
          <button 
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              background: filterStatus === status ? '#6366f1' : 'transparent',
              border: `1px solid ${filterStatus === status ? '#6366f1' : '#374151'}`,
              color: filterStatus === status ? '#fff' : '#e2e8f0',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading spinner...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1f2937' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Order ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>User ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Items</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Amount</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Status</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o, i) => (
                <React.Fragment key={o.id || i}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === o.id ? null : o.id)}
                    style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117', cursor: 'pointer' }}
                  >
                    <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(o.id).substring(0, 8)}...</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(o.userId).substring(0, 8)}...</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{o.items?.length || 0}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #1f2937', fontWeight: 'bold' }}>${Number(o.totalAmount).toFixed(2)}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
                      <select
                        value={o.status || 'PENDING'}
                        onChange={async (e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to change this order status?')) {
                            try {
                              await api.patch(`/orders/${o.id}/status`, { status: e.target.value });
                              fetchOrders();
                            } catch (err) {
                              console.error(err);
                              window.alert('Failed to update order status');
                            }
                          }
                        }}
                        style={{
                          padding: '4px 8px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                          background: `${getStatusColor(o.status)}33`, color: getStatusColor(o.status),
                          border: 'none', outline: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center'
                        }}
                      >
                        <option value="PENDING" style={{ background: '#111827', color: '#f59e0b' }}>PENDING</option>
                        <option value="CONFIRMED" style={{ background: '#111827', color: '#10b981' }}>CONFIRMED</option>
                        <option value="CANCELLED" style={{ background: '#111827', color: '#ef4444' }}>CANCELLED</option>
                      </select>
                    </td>
                    <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                  {expandedRow === o.id && (
                    <tr>
                      <td colSpan="6" style={{ padding: 0, borderBottom: '1px solid #1f2937' }}>
                        <div style={{ background: '#1f2937', padding: '16px 24px' }}>
                          <h4 style={{ margin: '0 0 12px 0', color: '#9ca3af' }}>Order Items Detail</h4>
                          <div style={{ display: 'grid', gap: 8 }}>
                            {o.items?.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#111827', borderRadius: 8 }}>
                                <span>Product: {String(item.productId).substring(0, 8)}...</span>
                                <span>Qty: {item.quantity}</span>
                                <span>Price: ${item.price}</span>
                              </div>
                            )) || <div style={{ color: '#9ca3af' }}>No item details available</div>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}
