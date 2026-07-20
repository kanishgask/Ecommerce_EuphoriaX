import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { Star, ShoppingCart, Truck, Shield, ArrowLeft, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await productService.getBySlug(slug);
        const item = response.data.data;
        if (!item) {
          toast.error('Product not found');
          navigate('/products');
          return;
        }
        setProduct(item);
      } catch (error) {
        toast.error('Failed to load product details');
        console.error(error);
        navigate('/products');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors mb-8 font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="glass-panel rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row gap-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-square bg-gray-100 dark:bg-dark-800 rounded-2xl overflow-hidden relative">
            <img 
              src={images[activeImage]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div className="mb-2">
            <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">{product.category}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.ratingAverage || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-gray-500 ml-3">{product.ratingAverage || '4.5'} ({product.ratingCount || '120'} reviews)</span>
          </div>
          
          <div className="text-4xl font-black text-gray-900 dark:text-white mb-6">
            ${parseFloat(product.price).toFixed(2)}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            {product.description || 'Experience premium quality with this exceptional product. Designed to meet the highest standards of performance and aesthetics.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl p-1 bg-white dark:bg-dark-900">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-gray-500 hover:text-primary-600 transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 text-gray-500 hover:text-primary-600 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 btn-primary py-4 text-lg font-bold flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-6 w-6" />
              <span>Add to Cart</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Free Delivery</h4>
                <p className="text-xs text-gray-500">2-3 business days</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">1 Year Warranty</h4>
                <p className="text-xs text-gray-500">Full protection included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
