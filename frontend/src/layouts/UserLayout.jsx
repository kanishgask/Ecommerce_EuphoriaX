import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Package, Search, Globe, Share2, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import CartDrawer from '../components/CartDrawer';

export default function UserLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { items, isOpen, toggleCart } = useCartStore();
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-white font-sans selection:bg-primary-600 selection:text-white">
      {/* Navbar */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? 'glass-panel py-3 border-b border-white/5' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link to="/home" className="text-2xl font-black tracking-tighter">
            <span className="bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">Euphoria</span>
            <span className="text-white">X</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {[
              { name: 'Home', path: '/home' },
              { name: 'Shop', path: '/products' },
              { name: 'Categories', path: '/products' },
              { name: 'About', path: '/home' }
            ].map((item) => (
              <Link key={item.name} to={item.path} className="text-sm font-medium text-gray-300 hover:text-white relative group">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <button className="text-gray-300 hover:text-white transition-colors">
              <Search size={20} />
            </button>
            
            <button onClick={toggleCart} className="text-gray-300 hover:text-white transition-colors relative group">
              <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-fade-in shadow-lg shadow-amber-500/20">
                  {cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-sm font-bold border border-primary-500/30">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 glass-panel border border-white/10 rounded-xl shadow-2xl py-2 animate-slide-up">
                    <div className="px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <User size={16} className="mr-2 opacity-70" /> Profile
                    </Link>
                    <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                      <Package size={16} className="mr-2 opacity-70" /> Orders
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors">
                      <LogOut size={16} className="mr-2 opacity-70" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-5 text-sm rounded-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-primary-500/40">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12">
        <Outlet />
      </main>

      <CartDrawer isOpen={isOpen} onClose={toggleCart} />

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-black tracking-tighter inline-block mb-2">
              <span className="bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">Euphoria</span>
              <span className="text-white">X</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Elevate your lifestyle with our premium collection of curated products. Designed for the modern aesthetics.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"><Globe size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"><Share2 size={18} /></a>
              <a href="#" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white hover:border-primary-500/50 transition-all"><MessageCircle size={18} /></a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {['New Arrivals', 'Best Sellers', 'Categories', 'Collections'].map(link => (
                <li key={link}><a href="#" className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center group"><span className="w-0 h-px bg-primary-400 mr-0 transition-all duration-300 group-hover:w-3 group-hover:mr-2"></span>{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Customer Service</h4>
            <ul className="space-y-3">
              {['Contact Us', 'Shipping Policy', 'Returns & Exchanges', 'FAQs'].map(link => (
                <li key={link}><a href="#" className="text-sm text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center group"><span className="w-0 h-px bg-primary-400 mr-0 transition-all duration-300 group-hover:w-3 group-hover:mr-2"></span>{link}</a></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Stay Updated</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive offers and premium drops.</p>
            <div className="relative">
              <input type="email" placeholder="Enter your email" className="w-full bg-dark-800 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors" />
              <button className="absolute right-1 top-1 bottom-1 aspect-square rounded-full bg-gradient-to-r from-primary-600 to-primary-500 flex items-center justify-center text-white hover:scale-105 transition-transform">
                <span className="sr-only">Subscribe</span>
                →
              </button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2026 EuphoriaX. All rights reserved.</p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
