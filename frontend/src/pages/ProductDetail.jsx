import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Share2, Minus, Plus, ShoppingBag, ChevronRight } from 'lucide-react';
import { productService } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem, closeCart } = useCartStore();
  const { products } = useProductStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        let res;
        try {
          res = await productService.getBySlug(slug);
        } catch (err) {
          res = await productService.getById(slug);
        }
        const item = res.data?.data || res.data;
        if (item && (item.name || item.productId)) {
          setProduct(item);
        } else {
          throw new Error('Not found');
        }
      } catch (err) {
        const fallback = products.find(p => p.slug === slug || p.productId === slug || p.id === slug) || products[0];
        setProduct(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, products]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 animate-pulse flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-1/2 aspect-square bg-dark-800 rounded-3xl"></div>
        <div className="w-full lg:w-1/2 space-y-6 pt-8">
          <div className="h-4 bg-dark-800 rounded w-1/4"></div>
          <div className="h-10 bg-dark-800 rounded w-3/4"></div>
          <div className="h-6 bg-dark-800 rounded w-1/3"></div>
          <div className="h-32 bg-dark-800 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-6 py-32 text-center">
        <h2 className="text-3xl font-bold mb-4">{error || 'Product not found'}</h2>
        <Link to="/products" className="text-primary-400 hover:text-primary-300 underline">Back to Products</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999',
    'https://images.unsplash.com/photo-1486401899868-0e435ed85128?q=80&w=2070'
  ];

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight size={14} className="mx-2" />
        <Link to="/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight size={14} className="mx-2" />
        <span className="text-gray-300 truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left: Images */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-square bg-dark-900 rounded-3xl overflow-hidden border border-white/5 relative group p-8 flex items-center justify-center">
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
            {/* Badges */}
            <div className="absolute top-6 left-6">
              <span className="bg-primary-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-primary-600/20">
                {product.category || 'Premium'}
              </span>
            </div>
            {/* Actions */}
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              <button className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-white/20 transition-all hover:scale-110 shadow-xl">
                <Heart size={20} />
              </button>
              <button className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all hover:scale-110 shadow-xl">
                <Share2 size={20} />
              </button>
            </div>
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 p-2 bg-dark-900 transition-all ${activeImage === idx ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-dark-800'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" className="opacity-50" />
            </div>
            <span className="text-sm text-gray-400 font-medium">4.8 (124 reviews)</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-6 inline-block">
            ${product.price?.toFixed(2)}
          </div>

          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {product.description || 'Experience the pinnacle of design and functionality. Crafted with premium materials, this item elevates your everyday lifestyle.'}
          </p>

          <hr className="border-white/10 mb-8" />

          {/* Quantity & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center justify-between bg-dark-800 border border-white/10 rounded-2xl p-2 w-full sm:w-32 h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-lg w-8 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-grow flex gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-dark-800 hover:bg-dark-700 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:border-primary-500/50"
              >
                <ShoppingBag size={20} /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 h-14 bg-gradient-to-r from-primary-600 to-amber-500 text-white font-bold rounded-2xl hover:from-primary-500 hover:to-amber-400 transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Features Strip */}
          <div className="grid grid-cols-2 gap-4 mt-auto p-6 bg-dark-800/50 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center">
                <Truck size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Free Shipping</h4>
                <p className="text-xs text-gray-500">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">1 Year Warranty</h4>
                <p className="text-xs text-gray-500">Full protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                <RotateCcw size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">30 Days Return</h4>
                <p className="text-xs text-gray-500">No questions asked</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
