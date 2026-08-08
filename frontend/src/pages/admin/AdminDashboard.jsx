import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#f59e0b', '#10b981', '#ef4444'];

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] }))
      ]);
      
      const ordersData = Array.isArray(ordersRes.data?.data) ? ordersRes.data.data :
                         Array.isArray(ordersRes.data) ? ordersRes.data : 
                         (ordersRes.data?.data?.orders || ordersRes.data?.orders || []);
                         
      const productsData = Array.isArray(productsRes.data?.data) ? productsRes.data.data :
                           Array.isArray(productsRes.data) ? productsRes.data : 
                           (productsRes.data?.data?.products || productsRes.data?.products || []);

      setOrders(ordersData);
      setProductsCount(productsData.length);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const totalOrders = orders.length;
  const activeUsers = new Set(orders.map(o => o.userId).filter(Boolean)).size;

  // Chart data
  const ordersByDate = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt || Date.now()).toLocaleDateString();
    if (!acc[date]) acc[date] = 0;
    acc[date] += (Number(order.totalAmount) || 0);
    return acc;
  }, {});
  const areaData = Object.keys(ordersByDate).map(date => ({
    date,
    revenue: ordersByDate[date]
  }));

  const statusCount = orders.reduce((acc, order) => {
    const status = order.status || 'PENDING';
    if (!acc[status]) acc[status] = 0;
    acc[status]++;
    return acc;
  }, {});
  const pieData = Object.keys(statusCount).map((status, index) => ({
    name: status,
    value: statusCount[status],
    color: status === 'CONFIRMED' ? '#10b981' : status === 'CANCELLED' ? '#ef4444' : '#f59e0b'
  }));

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);

  const cardStyle = {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 16,
    padding: 20
  };

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
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={fetchStats} style={{ background: 'transparent', border: '1px solid #374151', color: '#e2e8f0', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
            Refresh Stats
          </button>
          <a href="/admin/products" style={{ textDecoration: 'none' }}>
            <button style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
              Add Product
            </button>
          </a>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading spinner...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
              <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Total Revenue</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#6366f1' }}>${totalRevenue.toFixed(2)}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={cardStyle}>
              <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Total Orders</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#06b6d4' }}>{totalOrders}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={cardStyle}>
              <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Total Products</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{productsCount}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={cardStyle}>
              <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 8 }}>Active Users</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>{activeUsers}</div>
            </motion.div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: 20 }}>Revenue Overview</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: 20 }}>Orders by Status</h3>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                {pieData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }}></div>
                    {d.name}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: 20 }}>Recent Orders</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#1f2937' }}>
                    <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Order ID</th>
                    <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>User ID</th>
                    <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Amount</th>
                    <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Status</th>
                    <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={order.id || i} style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117' }}>
                      <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(order.id).substring(0, 8)}...</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(order.userId).substring(0, 8)}...</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>${Number(order.totalAmount).toFixed(2)}</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: 999, 
                          fontSize: 12, 
                          background: `${getStatusColor(order.status || 'PENDING')}33`, 
                          color: getStatusColor(order.status || 'PENDING') 
                        }}>
                          {order.status || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
                        {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
