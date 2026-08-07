import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Search, Filter, ChevronDown, Check, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectWishlistItems } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageTransition from '../components/shared/PageTransition';

import { PRODUCTS } from '../data/products';

const CATEGORIES = ['All Categories', 'Accessories', 'Electronics', 'Footwear', 'Fashion'];

const ToggleSwitch = ({ label, active, onClick }) => (
  <div className="flex items-center justify-between py-2.5 cursor-pointer group" onClick={onClick}>
    <span className={`text-sm transition-colors ${active ? 'text-white/70' : 'text-white/50 group-hover:text-white/70'}`}>
      {label}
    </span>
    <div className={`w-[42px] h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 ${active ? 'bg-[#2dd4bf]' : 'bg-[#1e293b]'}`}>
      <motion.div 
        layout
        className="w-4 h-4 bg-white rounded-full shadow-sm"
        animate={{ x: active ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  </div>
);

export default function ShopPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All Categories';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState(1000);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setActiveCategory(searchParams.get('category') || 'All Categories');
  }, [location.search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    // Update URL without reloading
    const newParams = new URLSearchParams(location.search);
    if (val) {
      newParams.set('q', val);
    } else {
      newParams.delete('q');
    }
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(location.search);
    if (cat && cat !== 'All Categories') {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success('Added to cart');
  };

  const filteredProducts = PRODUCTS.filter(p => 
    (activeCategory === 'All Categories' || p.category === activeCategory) &&
    p.price <= priceRange &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row gap-8">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 space-y-10">
            
            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-6 text-white font-bold text-lg">
                Categories <ChevronDown className="w-4 h-4 text-white/50 rotate-180" />
              </div>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <ToggleSwitch 
                    key={cat} 
                    label={cat} 
                    active={activeCategory === cat} 
                    onClick={() => handleCategoryChange(cat)} 
                  />
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <div className="flex items-center justify-between mb-2 text-white font-bold text-lg">
                Brand <ChevronDown className="w-4 h-4 text-white/50" />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-6 text-white font-bold text-lg">
                Price Range <ChevronDown className="w-4 h-4 text-white/50 rotate-180" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-4 font-medium tracking-wide">
                  <span>$100 - $1000+</span>
                  <span>$100 - $1000</span>
                </div>
                <div className="relative h-1.5 bg-[#1e293b] rounded-full mb-3">
                  <div className="absolute left-0 top-0 h-full bg-[#2dd4bf] rounded-full" style={{ width: `${(priceRange / 1000) * 100}%` }} />
                  <input 
                    type="range" 
                    min="100" 
                    max="1000" 
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#2dd4bf] rounded-full shadow-lg pointer-events-none" 
                    style={{ left: `calc(${(priceRange / 1000) * 100}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  <span>Range</span>
                  <span>Range</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 min-w-0">
          {/* Header & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 bg-[#121b22] p-4 sm:px-6 rounded-[24px] border border-white/5">
            <h1 className="text-2xl font-bold text-white">Homepage</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="w-4 h-4 text-white/30 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white/60" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search products..." 
                  className="w-full sm:w-64 h-10 rounded-full border border-white/10 bg-transparent pl-11 pr-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>
              <div className="relative">
                <select className="h-10 rounded-full border border-white/10 bg-transparent pl-4 pr-10 text-sm text-white/70 appearance-none focus:outline-none focus:border-white/30">
                  <option className="bg-[#121b22]">Sort by All Models</option>
                  <option className="bg-[#121b22]">Price: Low to High</option>
                  <option className="bg-[#121b22]">Price: High to Low</option>
                </select>
                <ChevronDown className="w-4 h-4 text-white/30 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-full flex flex-col p-5 bg-[#162028] rounded-[32px] group relative">
                    
                    {/* Image Container */}
                    <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 bg-white">
                      <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>
                      <button 
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors shadow-sm"
                        onClick={() => dispatch(toggleWishlist(product))}
                      >
                        <Heart className={`w-5 h-5 ${wishlistItems.some(i => i.id === product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Content Container */}
                    <div className="flex flex-col flex-1 px-1">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-base font-semibold text-white mb-2">{product.name}</h3>
                      </Link>
                      
                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < product.rating ? 'text-[#eab308] fill-[#eab308]' : 'text-white/20'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-white/40 font-medium">({product.reviews})</span>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <p className="text-xl font-bold text-white mb-4">${product.price}</p>
                        <button 
                          className="w-full bg-[#2dd4bf] hover:bg-[#14b8a6] text-[#0f172a] font-bold py-3.5 px-4 rounded-xl transition-colors"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-24 text-white/50">
              No products found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
