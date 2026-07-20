import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import { Star, ShoppingCart, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const { addItem } = useCartStore();

  const categories = ['All', 'Electronics', 'Clothing', 'Home', 'Sports'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productService.getAll();
        // Assume backend sends { success: true, data: { items: [...] } } or { data: [...] }
        const items = response.data.data?.items || response.data.data || [];
        setProducts(items);
      } catch (error) {
        toast.error('Failed to load products');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = categoryFilter === 'All' 
    ? products 
    : products.filter(p => p.category === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Our Collection</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Browse our premium selection of quality products.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white dark:bg-dark-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <Filter className="h-5 w-5 text-gray-400 ml-2" />
          <div className="flex space-x-1 overflow-x-auto p-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <Link key={product.productId} to={`/products/${product.slug}`} className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300 block">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-primary-600/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                  {product.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white truncate">{product.name}</h3>
                <div className="flex items-center mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{product.ratingAverage || '4.5'}</span>
                  <span className="text-xs text-gray-500 ml-2">({product.ratingCount || '120'})</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addItem(product, 1);
                    }}
                    className="p-3 bg-dark-900 text-white dark:bg-white dark:text-dark-900 rounded-xl hover:scale-110 hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
