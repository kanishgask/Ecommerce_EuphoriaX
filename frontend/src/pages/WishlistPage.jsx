import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { selectWishlistItems, toggleWishlist } from '../store/slices/wishlistSlice';
import PageTransition from '../components/shared/PageTransition';
import Button from '../components/ui/Button';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen">
        
        <div className="flex items-center justify-between mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight"
          >
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Wishlist</span>
          </motion.h1>
          <div className="text-white/50 text-sm font-medium bg-[#121b22] px-4 py-2 rounded-full border border-white/5">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center bg-[#121b22] rounded-[32px] border border-white/5 shadow-2xl"
          >
            <div className="w-24 h-24 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 mb-6">
              <Heart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">Explore our collection and add some premium items to your wishlist!</p>
            <Link to="/shop">
              <Button variant="gradient" size="lg">
                Explore Products <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-[#121b22] border border-white/5 rounded-3xl overflow-hidden hover:border-pink-500/30 transition-colors"
              >
                <div className="relative aspect-square bg-white overflow-hidden p-4">
                  <Link to={`/product/${item.id}`} className="block w-full h-full relative">
                    <img 
                      src={item.image || item.images[0]} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button 
                    onClick={() => dispatch(toggleWishlist(item))}
                    className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:scale-110 transition-all z-10 shadow-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg line-clamp-1">{item.name}</h3>
                    <p className="text-cyan-400 font-bold">${item.price.toFixed(2)}</p>
                  </div>
                  <p className="text-white/50 text-sm mb-6">{item.category}</p>
                  
                  <Link to={`/product/${item.id}`}>
                    <Button variant="outline" className="w-full text-sm h-12 hover:bg-pink-500 hover:border-pink-500 hover:text-white transition-all">
                      View Product
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
