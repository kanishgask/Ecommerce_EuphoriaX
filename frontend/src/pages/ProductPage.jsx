import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Star, Share2, Truck, ShieldCheck, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectWishlistItems } from '../store/slices/wishlistSlice';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import ProductReviews from '../components/product/ProductReviews';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PageTransition from '../components/shared/PageTransition';
import { PRODUCTS } from '../data/products';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('reviews');
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const isWishlisted = wishlistItems.some(i => i.id === product.id);

  const handleAddToCart = () => {
    dispatch(addToCart({ ...product, quantity }));
    toast.success('Added to cart');
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-[#0b1114]">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-white/50 hover:text-cyan-400 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button 
                  className={`w-10 h-10 bg-[#121b22]/80 backdrop-blur-md rounded-full flex items-center justify-center transition-colors border border-white/10 ${isWishlisted ? 'text-red-500' : 'text-white hover:text-red-500'}`}
                  onClick={() => dispatch(toggleWishlist(product))}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
                <button className="w-10 h-10 bg-[#121b22]/80 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:text-cyan-400 transition-colors border border-white/10">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-cyan-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              
              <div className="mb-4 flex items-center gap-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{product.category}</span>
                <motion.span 
                  animate={{ scale: [1, 1.05, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-[10px] font-black text-white shadow-[0_0_10px_rgba(236,72,153,0.5)] uppercase tracking-wider"
                >
                  Diwali Sale - 50% Off!
                </motion.span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-cyan-400 fill-cyan-400' : 'text-white/20'}`} />
                  ))}
                </div>
                <span className="text-white/50 text-sm">{product.rating} ({product.reviews} reviews)</span>
              </div>
              
              <p className="text-3xl font-extrabold text-white mb-8">${product.price.toFixed(2)}</p>
              
              <p className="text-white/70 leading-relaxed mb-8">{product.description}</p>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 h-14">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-white/50 hover:text-cyan-400">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-white">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-white/50 hover:text-cyan-400">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button variant="gradient" size="lg" className="flex-1 h-14 text-lg" onClick={handleAddToCart}>
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </Button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-4">
                <Card glass={false} className="p-4 flex items-center gap-3 bg-[#121b22] border-white/5">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-white">Free Delivery</p>
                    <p className="text-white/50">2-3 Business Days</p>
                  </div>
                </Card>
                <Card glass={false} className="p-4 flex items-center gap-3 bg-[#121b22] border-white/5">
                  <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-white">1 Year Warranty</p>
                    <p className="text-white/50">Official Brand</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>

        {/* --- TABS & REVIEWS SECTION --- */}
        <div className="mt-24">
          <div className="flex overflow-x-auto no-scrollbar gap-8 border-b border-white/10 mb-8">
            {['description', 'specifications', 'shipping', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap relative transition-colors ${
                  activeTab === tab ? 'text-cyan-400' : 'text-white/40 hover:text-white/80'
                }`}
              >
                {tab === 'reviews' ? `Customer Reviews (${product.reviews})` : tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="product-tab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-t-md"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'description' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 leading-relaxed max-w-3xl">
                {product.description}
              </motion.div>
            )}
            {activeTab === 'specifications' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 max-w-3xl">
                <ul className="space-y-4">
                  {product.specs.map((spec, i) => (
                    <li key={i} className="flex justify-between border-b border-white/5 pb-2">
                      <span className="font-medium text-white/50">{spec.label}</span>
                      <span className="font-bold text-white">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            {activeTab === 'shipping' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/70 max-w-3xl space-y-4">
                <p><strong>Standard Shipping:</strong> 3-5 business days (Free over $100)</p>
                <p><strong>Express Shipping:</strong> 1-2 business days ($15.00)</p>
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <ProductReviews productId={id || PRODUCT.id} />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
