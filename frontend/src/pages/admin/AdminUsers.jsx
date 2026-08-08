import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setApiFailed(false);
    try {
      const res = await api.get('/users');
      const data = Array.isArray(res.data?.data) ? res.data.data :
                   Array.isArray(res.data) ? res.data : 
                   (res.data?.data?.users || res.data?.users || []);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setApiFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: 24, background: '#0d1117', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <h1 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 'bold' }}>User Management</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Loading spinner...</div>
      ) : apiFailed ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>User Data is managed by AWS Cognito</h2>
          <p style={{ color: '#9ca3af', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px auto' }}>
            Direct access to user records via the admin API is disabled or not available. Please manage your users directly through the AWS Cognito Console for enhanced security and compliance.
          </p>
          <a href="https://console.aws.amazon.com/cognito" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontWeight: 'bold', fontSize: 16 }}>
              Open AWS Cognito Console
            </button>
          </a>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1f2937' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>User ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Email</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>First Name</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Last Name</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id || i} style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117' }}>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(u.id).substring(0, 8)}...</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{u.email}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{u.firstName || '-'}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{u.lastName || '-'}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
