import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Package, CheckCircle, RefreshCw, Loader2, Plus, Minus, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, inventoryService } from '../../services/api';
import { useProductStore } from '../../store/productStore';

const getBadgeStyle = (status) => {
  switch (status) {
    case 'Healthy': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'Low Stock': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'Out of Stock': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const Inventory = () => {
  const { products, fetchProducts, adjustStock, isLoading: loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const items = (Array.isArray(products) ? products : []).map((p, idx) => {
    const stk = p && p.stock !== undefined ? Number(p.stock) : 10;
    const st = stk > 15 ? 'Healthy' : stk > 0 ? 'Low Stock' : 'Out of Stock';
    const catStr = String((p && p.category) || 'GEN');
    return {
      id: p ? (p.id || p.productId || p._id || `PROD-${idx + 100}`) : `PROD-${idx + 100}`,
      sku: `SKU-${catStr.slice(0, 3).toUpperCase()}-${100 + idx}`,
      name: (p && p.name) ? String(p.name) : 'Product',
      category: catStr,
      stock: stk,
      reorderPoint: 15,
      status: st,
      lastUpdated: 'Live'
    };
  });

  const handleQuickAdjust = async (id, delta) => {
    await adjustStock(id, delta);
    toast.success(delta > 0 ? `Added ${delta} units to stock! Live on storefront!` : `Removed ${Math.abs(delta)} units from stock!`);
  };

  const filteredItems = items.filter(item => {
    const q = String(searchQuery || '').toLowerCase();
    const matchesSearch = String(item.name || '').toLowerCase().includes(q) || 
                          String(item.sku || '').toLowerCase().includes(q) ||
                          String(item.id || '').toLowerCase().includes(q) ||
                          String(item.category || '').toLowerCase().includes(q);
    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'LOW') return matchesSearch && (item.status === 'Low Stock' || item.status === 'Out of Stock');
    if (filterStatus === 'OUT') return matchesSearch && item.status === 'Out of Stock';
    return matchesSearch;
  });

  const healthyCount = items.filter(i => i.status === 'Healthy').length;
  const lowCount = items.filter(i => i.status === 'Low Stock').length;
  const outCount = items.filter(i => i.status === 'Out of Stock').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inventory Management</h1>
          <p className="text-gray-400 text-sm">Monitor stock levels, set reorder alerts, and adjust quantities in real time.</p>
        </div>
        <button onClick={fetchProducts} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          <span>Sync Inventory</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-400 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium uppercase">Healthy Stock</p>
            <h4 className="text-2xl font-bold text-white mt-0.5">{healthyCount} items</h4>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium uppercase">Low Stock Alerts</p>
            <h4 className="text-2xl font-bold text-yellow-400 mt-0.5">{lowCount} items</h4>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium uppercase">Out of Stock</p>
            <h4 className="text-2xl font-bold text-red-400 mt-0.5">{outCount} items</h4>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, product name, or ID..." 
            className="w-full bg-dark-800 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setFilterStatus('ALL')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'ALL' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            All Items
          </button>
          <button 
            onClick={() => setFilterStatus('LOW')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'LOW' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            Low Stock ({lowCount})
          </button>
          <button 
            onClick={() => setFilterStatus('OUT')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === 'OUT' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            Out of Stock ({outCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">SKU / ID</th>
                <th className="p-4 font-medium">Product Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-center">Available Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Last Updated</th>
                <th className="p-4 font-medium text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    No inventory items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-mono text-xs text-primary-400 font-bold">{item.sku}</td>
                    <td className="p-4 font-medium text-white">{item.name}</td>
                    <td className="p-4 text-gray-400 text-xs">{item.category}</td>
                    <td className="p-4 text-center">
                      <span className="font-mono font-bold text-base text-white">{item.stock}</span>
                      <span className="text-xs text-gray-500 ml-1">units</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-block ${getBadgeStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{item.lastUpdated}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleQuickAdjust(item.id, -1)} 
                          className="w-8 h-8 rounded-lg bg-dark-800 border border-white/10 hover:bg-white/10 text-gray-300 flex items-center justify-center font-bold"
                          title="Remove 1 unit"
                        >
                          <Minus size={14} />
                        </button>
                        <button 
                          onClick={() => handleQuickAdjust(item.id, 1)} 
                          className="w-8 h-8 rounded-lg bg-dark-800 border border-white/10 hover:bg-primary-500/20 hover:border-primary-500/30 text-primary-400 flex items-center justify-center font-bold"
                          title="Add 1 unit"
                        >
                          <Plus size={14} />
                        </button>
                        <button 
                          onClick={() => handleQuickAdjust(item.id, 10)} 
                          className="px-2.5 h-8 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold hover:from-primary-500 hover:to-primary-400 shadow-sm flex items-center gap-1"
                          title="Quick restock (+10 units)"
                        >
                          +10
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
    </div>
  );
};

export default Inventory;
