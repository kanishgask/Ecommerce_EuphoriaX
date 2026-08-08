import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const CATEGORIES = ['Electronics', 'Fashion', 'Accessories', 'Footwear'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    imageUrl: '',
    rating: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      const data = Array.isArray(res.data?.data) ? res.data.data :
                   Array.isArray(res.data) ? res.data : 
                   (res.data?.data?.products || res.data?.products || []);
      setProducts(data);
    } catch (err) {
      console.error(err);
      window.alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || 'Electronics',
        imageUrl: product.imageUrl || '',
        rating: product.rating || ''
      });
    } else {
      setFormData({
        id: null,
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        imageUrl: '',
        rating: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, price: Number(formData.price), rating: Number(formData.rating) };
      if (formData.id) {
        await api.put(`/products/${formData.id}`, payload);
        window.alert('Product updated successfully');
      } else {
        await api.post('/products', payload);
        window.alert('Product created successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      window.alert('Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        window.alert('Product deleted');
        fetchProducts();
      } catch (err) {
        console.error(err);
        window.alert('Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'All' || p.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '16px', background: '#1f2937', 
    border: '1px solid #374151', borderRadius: '8px', color: '#fff', boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: 24, background: '#0d1117', minHeight: '100vh', color: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>Products</h1>
        <button onClick={() => handleOpenModal()} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>
          Add Product
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px 16px', background: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', width: 300 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', ...CATEGORIES].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                background: filterCat === cat ? '#6366f1' : 'transparent',
                border: `1px solid ${filterCat === cat ? '#6366f1' : '#374151'}`,
                color: filterCat === cat ? '#fff' : '#e2e8f0',
                borderRadius: 8, padding: '8px 16px', cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 16, padding: 20, overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading spinner...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1f2937' }}>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Image</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Name</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Category</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Price</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Rating</th>
                <th style={{ padding: 12, borderBottom: '1px solid #374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => (
                <tr key={p.id || i} style={{ background: i % 2 === 0 ? 'transparent' : '#0d1117' }}>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : '-'}
                  </td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{p.name}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{p.category}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>${p.price}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>{p.rating}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #1f2937' }}>
                    <button onClick={() => handleOpenModal(p)} style={{ background: 'transparent', border: 'none', color: '#06b6d4', cursor: 'pointer', marginRight: 12 }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: 20, textAlign: 'center', color: '#9ca3af' }}>No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#111827', padding: 24, borderRadius: 16, border: '1px solid #1f2937', width: '100%', maxWidth: 500 }}>
            <h2 style={{ marginTop: 0, marginBottom: 20 }}>{formData.id ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <input style={inputStyle} type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <textarea style={{...inputStyle, height: 80}} placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <input style={inputStyle} type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              <select style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input style={inputStyle} type="text" placeholder="Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              <input style={inputStyle} type="number" step="0.1" placeholder="Rating" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: '1px solid #374151', color: '#e2e8f0', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
