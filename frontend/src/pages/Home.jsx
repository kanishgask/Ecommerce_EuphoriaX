import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-dark-900 to-black z-0"></div>
        <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6"
          >
            Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Euphoria</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            Discover premium tech, fashion, and lifestyle products curated for excellence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/products" className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-dark-900 hover:bg-gray-100 font-bold rounded-full transition-all hover:scale-105 shadow-2xl">
              <span>Shop Collection</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mb-6">
              <Truck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Free Express Delivery</h3>
            <p className="text-gray-500 dark:text-gray-400">Get your orders delivered within 24 hours on premium products.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
            <p className="text-gray-500 dark:text-gray-400">100% secure checkout with end-to-end encryption.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-16 w-16 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mb-6">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
            <p className="text-gray-500 dark:text-gray-400">Every product is verified for top-tier quality and authenticity.</p>
          </div>
        </div>
      </section>
      
      {/* Trending Products */}
      <section className="py-20 bg-gray-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Trending Now</h2>
            <p className="text-gray-500 dark:text-gray-400">Most loved products by our customers this week.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="glass-panel rounded-2xl overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop`}
                    alt="Product"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                    Top Rated
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Premium Wireless Audio</h3>
                  <div className="flex items-center mb-4">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-500 ml-2">(124)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">$299.00</span>
                    <button className="p-2 bg-dark-900 text-white dark:bg-white dark:text-dark-900 rounded-full hover:scale-110 transition-transform">
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
