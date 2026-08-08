import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setApiFailed(false);
    try {
      let res;
      try {
        res = await api.get('/payments/all');
      } catch(e) {
        res = await api.get('/payments');
      }
      const data = Array.isArray(res.data?.data) ? res.data.data :
                   Array.isArray(res.data) ? res.data : 
                   (res.data?.data?.payments || res.data?.payments || []);
      setPayments(data);
    } catch (err) {
      console.error(err);
      setApiFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const successfulRevenue = payments
    .filter(p => p.status === 'SUCCESS' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const getStatusColor = (status) => {
    const s = String(status).toUpperCase();
    if (s === 'SUCCESS' || s === 'COMPLETED') return '#10b981';
    if (s === 'FAILED') return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div style={{ padding: 24, background: '#0d1117', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>Payments</h1>
        {!apiFailed && !loading && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#9ca3af' }}>Successful Revenue:</span>
            <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: 18 }}>${successfulRevenue.toFixed(2)}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading spinner...</div>
      ) : apiFailed ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Payment Data Unavailable</h2>
          <p style={{ color: '#9ca3af', maxWidth: 400, margin: '0 auto' }}>
            We couldn't fetch the payment records at this time. This might be due to API restrictions or the payment service being unreachable.
          </p>
          <button onClick={fetchPayments} style={{ marginTop: 24, background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
            Try Again
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1f2937' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Payment ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Order ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>User ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Amount</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Status</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id || i} style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117' }}>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(p.id).substring(0, 8)}...</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(p.orderId).substring(0, 8)}...</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(p.userId).substring(0, 8)}...</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937', fontWeight: 'bold' }}>${Number(p.amount).toFixed(2)}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
                    <span style={{ padding: '4px 8px', borderRadius: 999, fontSize: 12, background: `${getStatusColor(p.status)}33`, color: getStatusColor(p.status) }}>
                      {p.status || 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No payments found</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
