import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const card = { background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 20 };
const badge = (color) => ({
  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
  background: color + '22', color: color
});

export default function AdminNotifications() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      const allOrders = res.data?.data?.orders || res.data?.data || res.data || [];
      setOrders(Array.isArray(allOrders) ? allOrders : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const notifications = orders.map(o => ({
    id: o.id,
    type: o.status === 'CONFIRMED' ? 'success' : o.status === 'CANCELLED' ? 'error' : 'pending',
    title: o.status === 'CONFIRMED'
      ? `Order #${o.id?.slice(0, 8)} confirmed`
      : o.status === 'CANCELLED'
      ? `Order #${o.id?.slice(0, 8)} cancelled`
      : `New order #${o.id?.slice(0, 8)} placed`,
    description: `Amount: $${o.totalAmount} • User: ${o.userId?.slice(0, 12)}...`,
    time: new Date(o.createdAt).toLocaleString()
  })).sort((a, b) => new Date(b.time) - new Date(a.time));

  const iconMap = {
    success: <CheckCircle size={18} color="#10b981" />,
    error: <XCircle size={18} color="#ef4444" />,
    pending: <Clock size={18} color="#f59e0b" />
  };
  const colorMap = { success: '#10b981', error: '#ef4444', pending: '#f59e0b' };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Notifications</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>Order activity and system events</p>
        </div>
        <button onClick={fetchData} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
          background: '#1f2937', border: '1px solid #374151', borderRadius: 10,
          color: '#e2e8f0', cursor: 'pointer', fontSize: 14, fontWeight: 500
        }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Events', value: notifications.length, color: '#6366f1' },
          { label: 'Confirmed Orders', value: notifications.filter(n => n.type === 'success').length, color: '#10b981' },
          { label: 'Pending Orders', value: notifications.filter(n => n.type === 'pending').length, color: '#f59e0b' }
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} style={card}>
            <p style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>{stat.label}</p>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</h2>
          </motion.div>
        ))}
      </div>

      {/* Notification Feed */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Bell size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Activity Feed</h3>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No notifications yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {notifications.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 10,
                  background: i % 2 === 0 ? 'transparent' : '#0d1117',
                  borderLeft: `3px solid ${colorMap[n.type]}`
                }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: colorMap[n.type] + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {iconMap[n.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{n.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{n.description}</p>
                </div>
                <span style={{ fontSize: 12, color: '#4b5563', whiteSpace: 'nowrap' }}>{n.time}</span>
                <span style={badge(colorMap[n.type])}>{n.type}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
