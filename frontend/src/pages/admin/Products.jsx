import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Eye, Package, X, Check, Loader2, DollarSign, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../store/productStore';

const getStatusBadge = (status) => {
  switch(status) {
    case 'In Stock': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'Low Stock': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'Out of Stock': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const formatPrice = (val) => {
  if (typeof val === 'number') return `$${val.toFixed(2)}`;
  if (typeof val === 'string' && val.startsWith('$')) return val;
  return `$${Number(val || 0).toFixed(2)}`;
};

const Products = () => {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, adjustStock, isLoading: loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAdjustVal, setStockAdjustVal] = useState(0);

  // Form State for Add Product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    stock: 10,
    image: '',
    description: ''
  });

  // Form State for Edit Product
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    stock: 0,
    image: '',
    description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      return toast.error("Please enter name and price.");
    }

    await addProduct(newProduct);
    toast.success("Product created! Now live on Customer Storefront!");
    setIsAddModalOpen(false);
    setNewProduct({ name: '', category: 'Electronics', price: '', stock: 10, image: '', description: '' });
  };

  const openEditModal = (product) => {
    const rawPrice = typeof product.price === 'number' ? product.price : (product.price ? product.price.toString().replace(/[^0-9.-]+/g,"") : "0");
    setEditForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: rawPrice,
      stock: product.stock,
      image: product.image || product.images?.[0] || '',
      description: product.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    await updateProduct(editForm.id, editForm);
    setIsEditModalOpen(false);
    toast.success("Product updated in real-time! Check customer storefront!");
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product from the catalog?")) return;
    await deleteProduct(id);
    toast.success("Product deleted successfully!");
  };

  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const val = parseInt(stockAdjustVal) || 0;
    if (val === 0) return setIsStockModalOpen(false);

    await adjustStock(selectedProduct.id, val);
    toast.success(val > 0 ? `Added ${val} units to stock` : `Removed ${Math.abs(val)} units from stock`);
    setIsStockModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const q = String(searchQuery || '').toLowerCase();
    return String(p.name || '').toLowerCase().includes(q) || 
           String(p.category || '').toLowerCase().includes(q) ||
           String(p.id || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Products & Catalog</h1>
          <p className="text-gray-400 text-sm">Manage inventory items, update retail prices, and organize product categories in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProducts} className="btn-secondary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>Sync API</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
          >
            <Plus size={18} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center bg-dark-900/60 border border-white/10">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or category..."
            className="w-full pl-10 pr-4 py-2 bg-dark-950/80 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Total Catalog Items:</span>
          <strong className="text-white font-mono bg-dark-950 px-2.5 py-1 rounded-lg border border-white/5">{products.length}</strong>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden bg-dark-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">ID / SKU</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Retail Price ($)</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image || p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white/5 border border-white/10" />
                        <div>
                          <p className="font-bold text-white group-hover:text-primary-400 transition-colors">{p.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-400">{p.id}</td>
                    <td className="p-4 text-gray-300 text-xs">{p.category}</td>
                    <td className="p-4 font-bold text-amber-400">
                      <button 
                        onClick={() => openEditModal(p)} 
                        className="hover:underline flex items-center gap-1 group/price"
                        title="Click to edit retail price"
                      >
                        <span>{formatPrice(p.price)}</span>
                        <Edit size={12} className="opacity-0 group-hover/price:opacity-100 text-gray-400 transition-opacity" />
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{p.stock}</span>
                        <button 
                          onClick={() => { setSelectedProduct(p); setStockAdjustVal(0); setIsStockModalOpen(true); }}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-primary-500/20 text-[10px] font-bold text-primary-400 border border-white/5"
                          title="Adjust stock"
                        >
                          ± Adjust
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-block ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(p)} 
                          className="p-2 rounded-lg bg-dark-800 hover:bg-primary-600/20 text-gray-400 hover:text-primary-400 border border-white/5 hover:border-primary-500/30 transition-all"
                          title="Edit product details & price"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)} 
                          className="p-2 rounded-lg bg-dark-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-white/15 bg-dark-900 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-primary-400" /> Add New Product
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Pro Earbuds"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="149.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Product description and key specifications..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-white/15 bg-dark-900 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit size={20} className="text-amber-400" /> Edit Product Details
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={editForm.image}
                    onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                    className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600"
                >
                  <Save size={14} /> Save Real-time Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl border border-white/15 bg-dark-900 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Package size={18} className="text-primary-400" /> Adjust Stock Level
              </h3>
              <button onClick={() => setIsStockModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-300 mb-4">
              Adjusting inventory for <strong className="text-white">{selectedProduct.name}</strong>. Current stock: <strong className="text-amber-400 font-mono">{selectedProduct.stock}</strong> units.
            </p>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Adjustment Amount (±)</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setStockAdjustVal((prev) => Number(prev) - 5)} className="px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm font-bold text-red-400 hover:bg-white/5">-5</button>
                  <button type="button" onClick={() => setStockAdjustVal((prev) => Number(prev) - 1)} className="px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm font-bold text-red-400 hover:bg-white/5">-1</button>
                  <input
                    type="number"
                    value={stockAdjustVal}
                    onChange={(e) => setStockAdjustVal(e.target.value)}
                    className="w-full text-center py-2 bg-dark-950 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-primary-500"
                  />
                  <button type="button" onClick={() => setStockAdjustVal((prev) => Number(prev) + 1)} className="px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm font-bold text-green-400 hover:bg-white/5">+1</button>
                  <button type="button" onClick={() => setStockAdjustVal((prev) => Number(prev) + 5)} className="px-3 py-2 bg-dark-950 border border-white/10 rounded-xl text-sm font-bold text-green-400 hover:bg-white/5">+5</button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsStockModalOpen(false)} className="btn-secondary text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs">Apply Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
