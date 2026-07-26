import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star, Truck, ShieldCheck, Clock, CreditCard, ChevronDown, Eye, Heart, Sparkles, Flame, Tag, CheckCircle2, Award, Zap, X } from 'lucide-react';
import { productService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { id: 1, name: 'Electronics', count: '1,240+ Items', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop', discount: 'Up to 40% OFF' },
  { id: 2, name: 'Fashion', count: '3,800+ Items', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop', discount: 'New Season' },
  { id: 3, name: 'Home', count: '950+ Items', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=800&auto=format&fit=crop', discount: 'Best Sellers' },
  { id: 4, name: 'Sports', count: '620+ Items', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop', discount: 'Top Rated' },
];

const TESTIMONIALS = [
  { id: 1, name: 'Sarah Jenkins', role: 'Verified Buyer', comment: 'The shipping speed and product quality from EuphoriaX blew me away! My Sony XM5s arrived next day in flawless condition.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', rating: 5 },
  { id: 2, name: 'David Miller', role: 'Tech Enthusiast', comment: 'Best e-commerce UI I have ever used. Seamless checkout, real-time tracking, and unbeatable prices on premium gadgets.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', rating: 5 },
  { id: 3, name: 'Elena Rostova', role: 'Interior Designer', comment: 'I source half my home staging items from EuphoriaX now. The curation is world-class and customer support is truly 24/7.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', rating: 5 },
];

const FEATURES = [
  { icon: Truck, title: 'Express Free Shipping', desc: 'Complimentary on orders over $50' },
  { icon: ShieldCheck, title: '2-Year Full Warranty', desc: '100% replacement protection' },
  { icon: Clock, title: '24/7 Priority Support', desc: 'Live executive chat support' },
  { icon: CreditCard, title: 'Vault-Secure Checkout', desc: '256-bit SSL encrypted billing' },
];

const Home = () => {
  const { products, fetchProducts, isLoading: loading } = useProductStore();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [wishlist, setWishlist] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  const [liveTicker, setLiveTicker] = useState('⚡ Sarah from New York just purchased Sony WH-1000XM5 Headphones!');
  
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProducts();


    // Flash Sale Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    // Live Sales Ticker rotation
    const tickers = [
      '⚡ Sarah from New York just purchased Sony WH-1000XM5 Headphones!',
      '🔥 Michael from Texas just saved $150 on Apple Watch Series 9!',
      '💎 Elena from Tokyo added Designer Leather Weekender to Wishlist!',
      '🚀 Over 1,400 orders shipped out in the last 24 hours!'
    ];
    let tickIdx = 0;
    const tickerInterval = setInterval(() => {
      tickIdx = (tickIdx + 1) % tickers.length;
      setLiveTicker(tickers[tickIdx]);
    }, 5000);

    return () => { clearInterval(timer); clearInterval(tickerInterval); };
  }, []);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name.slice(0, 25)}... added to cart!`);
  };

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      toast.success(updated[id] ? "Saved to Wishlist ❤️" : "Removed from Wishlist");
      return updated;
    });
  };

  const categoryTabs = React.useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'General'));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const target = activeCategory.toLowerCase();
        return pCat === target || (target === 'home' && pCat === 'home & living') || (target === 'home & living' && pCat === 'home') || pCat.includes(target) || target.includes(pCat);
      });

  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden font-sans">
      
      {/* 0. Live Flash Sale & Ticker Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-primary-800 to-indigo-900 py-2.5 px-4 text-xs sm:text-sm font-semibold border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 z-40 relative shadow-md">
        <div className="flex items-center gap-2 text-amber-300 animate-pulse">
          <Zap size={16} className="fill-current" />
          <span className="font-mono tracking-tight truncate max-w-md sm:max-w-none">{liveTicker}</span>
        </div>
        <div className="flex items-center gap-3 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <span className="text-gray-300 uppercase tracking-widest text-[10px] font-bold">⚡ Mega Flash Sale Ends In:</span>
          <div className="flex items-center gap-1 font-mono font-bold text-amber-400">
            <span className="bg-white/10 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span className="bg-white/10 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span className="bg-white/10 px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-dark-950 pt-10 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-primary-950/50 to-dark-900 z-0" />
        
        {/* Animated Decorative Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[32rem] h-[32rem] bg-primary-600/25 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-amber-500/15 rounded-full mix-blend-screen filter blur-[140px] animate-float" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/10 dark:bg-white/5 border border-white/15 backdrop-blur-md text-primary-300 text-sm font-bold tracking-wide mb-8 shadow-2xl">
              <Sparkles size={16} className="text-amber-400 animate-spin" />
              <span>EuphoriaX 2.0 • The Next Generation of E-Commerce</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 text-white leading-none">
              Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 animate-gradient">Extraordinary</span>
              <br />Every Day.
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
              Curated collections of premium tech, runway fashion, and luxury home living designed to elevate your lifestyle.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/products" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 hover:from-primary-500 hover:to-primary-400 text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all transform hover:-translate-y-1">
                <ShoppingBag size={22} />
                <span>Shop Premium Deals</span>
                <ArrowRight size={20} />
              </Link>
              <a href="#trending" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-lg flex items-center justify-center gap-2 backdrop-blur-md transition-all">
                <span>Explore Catalog</span>
                <ChevronDown size={20} className="animate-bounce" />
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-500/20 text-primary-400"><Award size={20} /></div>
                <div><h4 className="font-bold text-sm text-white">4.9/5 Rating</h4><p className="text-xs text-gray-400">10,000+ Reviews</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/20 text-green-400"><Truck size={20} /></div>
                <div><h4 className="font-bold text-sm text-white">Free Express</h4><p className="text-xs text-gray-400">On orders $50+</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400"><ShieldCheck size={20} /></div>
                <div><h4 className="font-bold text-sm text-white">2-Year Warranty</h4><p className="text-xs text-gray-400">100% Protected</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400"><Clock size={20} /></div>
                <div><h4 className="font-bold text-sm text-white">24/7 Support</h4><p className="text-xs text-gray-400">Live Concierge</p></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Features Strip */}
      <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-white/10 hover:border-primary-500/50 transition-all shadow-xl hover:-translate-y-1 group bg-dark-900/80"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform shrink-0 border border-primary-500/30">
                <feat.icon size={26} />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{feat.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Featured Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary-400 font-bold text-xs uppercase tracking-widest mb-2">
              <Tag size={14} /> Shop By Department
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">Curated Collections</h2>
          </div>
          <Link to="/products" className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-primary-400 font-bold text-sm transition-all flex items-center gap-2">
            <span>Explore All Catalog</span> <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => { setActiveCategory(cat.name); document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="h-[26rem] relative rounded-3xl overflow-hidden group cursor-pointer shadow-2xl border border-white/10"
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent transition-opacity duration-300" />
              
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold shadow-lg">
                  {cat.discount}
                </span>
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-1">{cat.count}</span>
                <h3 className="text-3xl font-extrabold text-white mb-4 group-hover:text-primary-300 transition-colors">{cat.name}</h3>
                <div className="flex items-center gap-2 text-sm font-bold text-white/90 group-hover:translate-x-2 transition-transform">
                  <span>Browse Products</span>
                  <ArrowRight size={16} className="text-primary-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Trending Products with Interactive Category Pills */}
      <section id="trending" className="py-24 bg-dark-900/60 border-t border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">
                <Flame size={14} className="fill-current animate-bounce" /> Hot Sellers This Week
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white">Trending Now</h2>
            </div>

            {/* Interactive Category Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-dark-950 rounded-2xl border border-white/10">
              {categoryTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                    activeCategory === tab
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'ALL' ? '⚡ All Deals' : tab}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-dark-800 rounded-3xl h-[440px] animate-pulse border border-white/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence>
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.productId || product._id || idx}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="glass-panel rounded-3xl overflow-hidden group border border-white/10 hover:border-primary-500/50 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(124,58,237,0.2)] bg-dark-900/90"
                  >
                    {/* Image Area */}
                    <div className="relative h-72 overflow-hidden bg-dark-950">
                      <img 
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {product.badge && (
                          <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-dark-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-lg">
                            {product.badge}
                          </span>
                        )}
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-gray-300">
                          {product.category || 'General'}
                        </span>
                      </div>

                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => { e.preventDefault(); toggleWishlist(product.productId || idx); }}
                        className={`absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md ${wishlist[product.productId || idx] ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black/80'}`}
                      >
                        <Heart size={18} className={wishlist[product.productId || idx] ? "fill-current" : ""} />
                      </button>

                      {/* Quick View Button */}
                      <button
                        onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }}
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/10 hover:bg-primary-600 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg duration-300"
                        title="Quick View"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Quick Add Overlay Button */}
                      <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <button 
                          onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                          className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all"
                        >
                          <ShoppingBag size={18} /> 
                          <span>Quick Add</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Star size={15} className="text-amber-400 fill-current" />
                          <span className="text-xs font-bold text-white">{product.ratingAverage || 4.8}</span>
                          <span className="text-xs text-gray-500">({product.reviews || 240})</span>
                        </div>
                        <span className="text-[11px] font-bold text-green-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> In Stock
                        </span>
                      </div>

                      <Link to={`/products/${product.slug || product.productId || product._id || 'f1'}`} className="block mb-4 flex-1">
                        <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-primary-400 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-baseline justify-between pt-3 border-t border-white/10">
                        <div>
                          <div className="text-2xl font-black text-white">
                            ${parseFloat(product.price).toFixed(2)}
                          </div>
                          {product.oldPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ${parseFloat(product.oldPrice).toFixed(2)}
                            </div>
                          )}
                        </div>
                        <Link 
                          to={`/products/${product.slug || product.productId || product._id || 'f1'}`}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-primary-600/20 text-xs font-bold text-primary-400 hover:text-primary-300 transition-all border border-white/5 hover:border-primary-500/30"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          <div className="mt-16 text-center">
            <Link to="/products" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-extrabold text-lg shadow-xl shadow-primary-500/25 transition-all transform hover:-translate-y-1">
              <span>Explore Entire 10,000+ Catalog</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials Carousel */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">
            ❤️ Community Love
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Loved by Over 50,000+ Shoppers</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base">Here is what our verified buyers say about their EuphoriaX experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.id} className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all shadow-xl bg-dark-900/80 flex flex-col justify-between relative">
              <div className="absolute top-6 right-6 text-primary-500/20 font-serif text-6xl font-black">“</div>
              <div>
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic relative z-10">"{t.comment}"</p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-500" />
                <div>
                  <h4 className="font-bold text-white text-sm">{t.name}</h4>
                  <span className="text-xs text-green-400 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={12} /> {t.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Newsletter & Club Strip */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-primary-950 to-indigo-950 z-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-64 bg-primary-500/20 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel p-12 md:p-16 rounded-3xl border border-white/15 shadow-2xl bg-black/40 backdrop-blur-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30 text-dark-950">
              <Award size={32} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Join the EuphoriaX VIP Club</h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto font-light">
              Subscribe today to unlock <strong className="text-amber-400 font-bold">$25 OFF</strong> your first order, plus members-only flash sales and instant order tracking.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => { e.preventDefault(); toast.success("Welcome to EuphoriaX VIP Club! Check your inbox for $25 voucher."); }}>
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                className="flex-1 px-6 py-4 rounded-2xl bg-dark-950/90 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base shadow-inner"
                required
              />
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-dark-950 font-black text-base rounded-2xl transition-all shadow-xl shadow-amber-500/25 whitespace-nowrap transform hover:-translate-y-0.5">
                Get $25 Voucher
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">We respect your privacy. Unsubscribe with one click at any time.</p>
          </motion.div>
        </div>
      </section>

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
                  <ShoppingBag size={20} /> Add to Cart
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

export default Home;
