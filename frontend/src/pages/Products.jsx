import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, ShoppingBag, Star, Heart, Eye, CheckCircle2, ArrowUpDown, LayoutGrid, Grid3X3, Grid2X2, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';

const Products = () => {
  const { products, fetchProducts, isLoading: loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('FEATURED'); // FEATURED, PRICE_LOW, PRICE_HIGH, RATING
  const [maxPrice, setMaxPrice] = useState(1000);
  const [gridCols, setGridCols] = useState(4); // 2, 3, or 4
  const [wishlist, setWishlist] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name.slice(0, 25)}... added to bag!`);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      toast.success(updated[id] ? "Saved to Wishlist ❤️" : "Removed from Wishlist");
      return updated;
    });
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'General'));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const pCat = (p.category || '').toLowerCase();
        const target = selectedCategory.toLowerCase();
        const matchesCat = selectedCategory === 'ALL' || pCat === target || (target === 'home' && pCat === 'home & living') || (target === 'home & living' && pCat === 'home') || pCat.includes(target) || target.includes(pCat);
        const matchesPrice = (p.price || 0) <= maxPrice;
        return matchesSearch && matchesCat && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_LOW') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'PRICE_HIGH') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'RATING') return (b.ratingAverage || 0) - (a.ratingAverage || 0);
        return 0; // FEATURED
      });
  }, [products, searchQuery, selectedCategory, sortBy, maxPrice]);

  return (
    <div className="min-h-screen bg-dark-950 text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Page Banner */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-purple-950/60 via-dark-900 to-indigo-950/60 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full filter blur-[120px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles size={13} /> Complete Store Collection
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
              Shop All Products
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Explore our complete catalog of precision-engineered gadgets, designer apparel, and modern lifestyle essentials.
            </p>
          </div>
        </div>

        {/* Filter & Control Bar */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-dark-900/80 shadow-lg space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headphones, jackets, watches..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-950 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort & View Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown size={14} /> Sort By:
                </span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-dark-950 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500"
                >
                  <option value="FEATURED">Featured Deals</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="RATING">Highest Customer Rating</option>
                </select>
              </div>

              {/* Grid Toggle Buttons */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-dark-950 rounded-xl border border-white/10">
                <button 
                  onClick={() => setGridCols(2)} 
                  className={`p-2 rounded-lg transition-all ${gridCols === 2 ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  title="2 Columns"
                >
                  <Grid2X2 size={16} />
                </button>
                <button 
                  onClick={() => setGridCols(3)} 
                  className={`p-2 rounded-lg transition-all ${gridCols === 3 ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  title="3 Columns"
                >
                  <Grid3X3 size={16} />
                </button>
                <button 
                  onClick={() => setGridCols(4)} 
                  className={`p-2 rounded-lg transition-all ${gridCols === 4 ? 'bg-primary-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  title="4 Columns"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips & Price Range Slider */}
          <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25 scale-105'
                      : 'bg-dark-950 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat === 'ALL' ? '⚡ All Categories' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 bg-dark-950 px-4 py-2 rounded-xl border border-white/5 w-full md:w-auto">
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">Max Price: <strong className="text-amber-400">${maxPrice}</strong></span>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="25" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full md:w-32 accent-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center px-2 text-xs text-gray-400">
          <span>Showing <strong className="text-white font-bold">{filteredAndSortedProducts.length}</strong> products</span>
          {(selectedCategory !== 'ALL' || searchQuery || maxPrice < 1000) && (
            <button 
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); setMaxPrice(1000); }}
              className="text-primary-400 hover:underline font-bold"
            >
              Reset All Filters ✕
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols} gap-6`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-dark-900 rounded-3xl h-[420px] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl text-center border border-white/10 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-500">
              <Filter size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No items match your criteria</h3>
            <p className="text-gray-400 text-sm mb-6">Try adjusting your search keywords, category selection, or maximum price filter.</p>
            <button 
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); setMaxPrice(1000); }} 
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${gridCols} gap-6`}>
            <AnimatePresence>
              {filteredAndSortedProducts.map((product, idx) => (
                <motion.div
                  key={product.productId || product._id || idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="glass-panel rounded-3xl overflow-hidden group border border-white/10 hover:border-primary-500/50 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(124,58,237,0.2)] bg-dark-900/90"
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden bg-dark-950">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.badge && (
                        <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-lg">
                          {product.badge}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-gray-300">
                        {product.category || 'General'}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => { e.preventDefault(); toggleWishlist(product.productId || idx); }}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md ${wishlist[product.productId || idx] ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/80'}`}
                    >
                      <Heart size={16} className={wishlist[product.productId || idx] ? "fill-current" : ""} />
                    </button>

                    <button
                      onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-primary-600 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg duration-300"
                      title="Quick View"
                    >
                      <Eye size={16} />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                        className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all"
                      >
                        <ShoppingBag size={16} /> 
                        <span>Add to Bag</span>
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-current" />
                          <span className="text-xs font-bold text-white">{product.ratingAverage || 4.8}</span>
                          <span className="text-[11px] text-gray-500">({product.reviews || 120})</span>
                        </div>
                        <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Stock: {product.stock || 12}
                        </span>
                      </div>

                      <Link to={`/products/${product.slug || product.productId || product._id || 'f1'}`} className="block mb-3">
                        <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-baseline justify-between pt-3 border-t border-white/10">
                      <div>
                        <div className="text-xl font-black text-white">
                          ${parseFloat(product.price).toFixed(2)}
                        </div>
                        {product.oldPrice && (
                          <div className="text-[11px] text-gray-500 line-through">
                            ${parseFloat(product.oldPrice).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <Link 
                        to={`/products/${product.slug || product.productId || product._id || 'f1'}`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary-600/20 text-xs font-bold text-primary-400 hover:text-primary-300 transition-all border border-white/5"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl flex flex-col md:flex-row bg-dark-900 animate-scale-in relative">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>

            <div className="md:w-1/2 h-72 md:h-auto bg-dark-950 relative">
              <img src={quickViewProduct.images?.[0]} alt={quickViewProduct.name} className="w-full h-full object-cover" />
            </div>

            <div className="md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider">
                  {quickViewProduct.category}
                </span>
                <h3 className="text-2xl font-black text-white mt-3 mb-2">{quickViewProduct.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
                  </div>
                  <span className="text-xs font-bold text-gray-300">({quickViewProduct.reviews || 240} reviews)</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Experience premium engineering and next-generation design. Comes complete with a 2-Year Full Warranty and 30-day money-back guarantee.
                </p>
                <div className="text-3xl font-black text-white mb-6">
                  ${parseFloat(quickViewProduct.price).toFixed(2)}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <ShoppingBag size={20} /> Add to Bag
                </button>
                <Link 
                  to={`/products/${quickViewProduct.slug || quickViewProduct.productId || quickViewProduct._id || 'f1'}`}
                  className="px-5 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center transition-all"
                >
                  Full Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
