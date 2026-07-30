import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, ShoppingBag, Star, Heart, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';

const Products = () => {
  const { products, fetchProducts, isLoading: loading } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters state
  const [selectedCategories, setSelectedCategories] = useState(['ALL']);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minPrice, setMinPrice] = useState(100);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('obsidian');
  
  // Sort and UI state
  const [sortBy, setSortBy] = useState('All Models');
  const [wishlist, setWishlist] = useState({});
  const [expandedSections, setExpandedSections] = useState({ categories: true, brand: true, price: true, size: true, color: true });

  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name.slice(0, 25)}... added to cart!`);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(!wishlist[id] ? "Saved to Wishlist ❤️" : "Removed from Wishlist");
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'General'));
    return Array.from(cats);
  }, [products]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      if (prev.includes(cat)) {
        const next = prev.filter(c => c !== cat);
        return next.length === 0 ? ['ALL'] : next;
      }
      return [...prev.filter(c => c !== 'ALL'), cat];
    });
  };

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const pCat = (p.category || 'General');
        const matchesCat = selectedCategories.includes('ALL') || selectedCategories.includes(pCat);
        const pPrice = p.price || 0;
        const matchesPrice = pPrice <= maxPrice;
        return matchesSearch && matchesCat && matchesPrice;
      })
      .sort((a, b) => b.ratingAverage - a.ratingAverage);
  }, [products, searchQuery, selectedCategories, minPrice, maxPrice]);

  return (
    <div className="min-h-screen bg-dark-950 text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        
        {/* Left Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 animate-fade-in pr-4">
          {/* Categories Toggle List */}
          <div className="border-b border-white/5 pb-6">
            <div 
              className="flex items-center justify-between cursor-pointer group mb-4"
              onClick={() => toggleSection('categories')}
            >
              <h3 className="font-semibold text-lg text-gray-200">Categories</h3>
              {expandedSections.categories ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </div>
            
            {expandedSections.categories && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">All Categories</span>
                  <button 
                    onClick={() => setSelectedCategories(['ALL'])}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${selectedCategories.includes('ALL') ? 'bg-primary-500' : 'bg-dark-700'}`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${selectedCategories.includes('ALL') ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                {categories.slice(0, 4).map(cat => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{cat}</span>
                    <button 
                      onClick={() => toggleCategory(cat)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${selectedCategories.includes(cat) ? 'bg-primary-500' : 'bg-dark-700'}`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${selectedCategories.includes(cat) ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Accordion */}
          <div className="border-b border-white/5 pb-6">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => toggleSection('brand')}
            >
              <h3 className="font-semibold text-lg text-gray-200">Brand</h3>
              <ChevronDown size={18} className="text-gray-500" />
            </div>
          </div>

          {/* Price Range */}
          <div className="border-b border-white/5 pb-6">
            <div 
              className="flex items-center justify-between cursor-pointer group mb-4"
              onClick={() => toggleSection('price')}
            >
              <h3 className="font-semibold text-lg text-gray-200">Price Range</h3>
              {expandedSections.price ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </div>
            {expandedSections.price && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                  <span>${minPrice} - ${maxPrice}+</span>
                  <span>$100 - $1000</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="1000" 
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary-500 h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-wider">
                  <span>Range</span>
                  <span>Range</span>
                </div>
              </div>
            )}
          </div>

          {/* Size Pills */}
          <div className="border-b border-white/5 pb-6">
            <div className="flex items-center justify-between cursor-pointer group mb-4" onClick={() => toggleSection('size')}>
              <h3 className="font-semibold text-lg text-gray-200">Size</h3>
              {expandedSections.size ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </div>
            {expandedSections.size && (
              <div className="flex gap-2">
                {['XS', 'M', 'L'].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-8 rounded-md text-xs font-bold transition-all border ${selectedSize === size ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Circles */}
          <div className="pb-6">
            <div className="flex items-center justify-between cursor-pointer group mb-4" onClick={() => toggleSection('color')}>
              <h3 className="font-semibold text-lg text-gray-200">Color</h3>
              {expandedSections.color ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </div>
            {expandedSections.color && (
              <div className="flex gap-3">
                {[
                  { id: 'obsidian', hex: '#1e293b' },
                  { id: 'emerald', hex: '#059669' },
                  { id: 'gold', hex: '#fbbf24' },
                  { id: 'white', hex: '#ffffff' }
                ].map(color => (
                  <button 
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-5 h-5 rounded-full transition-all ring-offset-2 ring-offset-dark-950 ${selectedColor === color.id ? 'ring-2 ring-primary-500 scale-110' : 'ring-1 ring-white/10 hover:scale-110'}`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900/50 p-4 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white tracking-tight">Homepage</h2>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="w-48 pl-9 pr-4 py-2 rounded-full bg-dark-950 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary-500 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-dark-950 rounded-full pr-4 border border-white/10 focus-within:border-primary-500">
                <span className="text-sm text-gray-400 pl-4 py-2">Sort by</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none appearance-none font-medium ml-2 cursor-pointer"
                >
                  <option value="All Models">All Models</option>
                  <option value="Trending">Trending</option>
                  <option value="Price">Price</option>
                </select>
                <ChevronDown size={14} className="text-gray-400 ml-1" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-dark-900 rounded-[32px] h-[400px] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className="glass-panel p-16 rounded-3xl text-center border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">No items match your filters</h3>
              <button 
                onClick={() => { setSelectedCategories(['ALL']); setSearchQuery(''); setMaxPrice(1000); }} 
                className="btn-primary mt-4"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredAndSortedProducts.map((product, idx) => (
                  <motion.div
                    key={product.productId || product._id || idx}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-dark-900 rounded-[32px] overflow-hidden border border-white/5 hover:border-primary-500/30 transition-all duration-300 group flex flex-col p-2"
                  >
                    {/* Image Area */}
                    <div className="relative h-56 bg-dark-950 rounded-[28px] overflow-hidden mb-3 p-4 flex items-center justify-center">
                      <img 
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                      />
                      
                      <button 
                        onClick={(e) => { e.preventDefault(); toggleWishlist(product.productId || idx); }}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all bg-dark-900/50 hover:bg-dark-800"
                      >
                        <Heart size={14} className={wishlist[product.productId || idx] ? "fill-primary-500 text-primary-500" : "text-gray-400"} />
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="px-4 pb-4 flex flex-col flex-1 justify-between">
                      <div>
                        <Link to={`/products/${product.slug || product.productId || product._id || 'f1'}`}>
                          <h3 className="font-medium text-gray-200 text-base mb-1 truncate group-hover:text-primary-400 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < Math.floor(product.ratingAverage || 5) ? "text-amber-400 fill-current" : "text-gray-600"} />
                          ))}
                          <span className="text-[10px] text-gray-500 ml-1">({product.reviews || 9})</span>
                        </div>
                        
                        <div className="text-lg font-bold text-white mb-4">
                          ${parseFloat(product.price).toFixed(0)}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 text-dark-950 font-bold text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
