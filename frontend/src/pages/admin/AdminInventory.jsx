import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function AdminInventory() {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newStock, setNewStock] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Fetch products first
      const pRes = await api.get('/products');
      const products = Array.isArray(pRes.data?.data) ? pRes.data.data :
                       Array.isArray(pRes.data) ? pRes.data : 
                       (pRes.data?.data?.products || pRes.data?.products || []);
      
      const invData = [];
      // For each product, try to fetch inventory status
      for (const p of products) {
        try {
          const invRes = await api.get(`/inventory/${p.id}`);
          const inv = invRes.data?.inventory || invRes.data || {};
          invData.push({
            productId: p.id,
            productName: p.name,
            availableStock: inv.availableStock !== undefined ? inv.availableStock : 0,
            reservedStock: inv.reservedStock || 0,
            updatedAt: inv.updatedAt || new Date().toISOString()
          });
        } catch (e) {
          // If individual fetch fails, push default
          invData.push({
            productId: p.id,
            productName: p.name,
            availableStock: 0,
            reservedStock: 0,
            updatedAt: new Date().toISOString()
          });
        }
      }
      setInventoryList(invData);
    } catch (err) {
      console.error(err);
      window.alert('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewStock(item.availableStock.toString());
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await api.put(`/inventory/${editingItem.productId}`, { quantity: Number(newStock) });
      window.alert('Stock updated successfully');
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
      window.alert('Error updating stock');
    }
  };

  const getStockColor = (stock) => {
    if (stock < 10) return '#ef4444';
    if (stock < 30) return '#f59e0b';
    return '#10b981';
  };

  const hasLowStock = inventoryList.some(i => i.availableStock < 10);

  return (
    <div style={{ padding: 24, background: '#0d1117', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>Inventory Management</h1>
        <button onClick={fetchInventory} style={{ background: 'transparent', border: '1px solid #374151', color: '#e2e8f0', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {hasLowStock && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#ef444433', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px 16px', borderRadius: 8, marginBottom: 24 }}>
          ⚠️ Warning: Some products have critically low stock (less than 10). Please replenish soon.
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading spinner...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1f2937' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Product Name</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Product ID</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Available Stock</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Reserved Stock</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Last Updated</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((item, i) => (
                <tr key={item.productId || i} style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117' }}>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{item.productName}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{String(item.productId).substring(0, 8)}...</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937', fontWeight: 'bold', color: getStockColor(item.availableStock) }}>
                    {item.availableStock}
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{item.reservedStock}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
                    <button onClick={() => handleEdit(item)} style={{ background: 'transparent', border: 'none', color: '#06b6d4', cursor: 'pointer' }}>Edit Stock</button>
                  </td>
                </tr>
              ))}
              {inventoryList.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No inventory records found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#111827', padding: 24, borderRadius: 16, border: '1px solid #1f2937', width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Update Stock</h2>
            <p style={{ color: '#9ca3af', marginBottom: 20 }}>{editingItem?.productName}</p>
            
            <input 
              type="number" 
              value={newStock} 
              onChange={e => setNewStock(e.target.value)} 
              style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid #374151', color: '#e2e8f0', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Update</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
