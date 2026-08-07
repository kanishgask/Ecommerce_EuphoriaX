import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, User, Search, Menu, X, Bell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDrawer, selectCartItemsCount } from '../store/slices/cartSlice';
import { selectUser } from '../store/slices/authSlice';
import { cn } from '../utils/cn';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartItemsCount);
  const user = useSelector(selectUser);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled ? 'glass py-4' : 'bg-transparent py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group z-50">
            <span className="font-extrabold text-2xl tracking-tight text-gradient">EuphoriaX</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'text-sm font-semibold transition-colors duration-300 relative',
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-primary rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Icons & Actions */}
          <div className="flex items-center gap-5 z-50">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-white/70 hover:text-cyan-400 transition-colors hidden sm:block"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link to="/wishlist" className="text-white/70 hover:text-red-500 transition-colors relative hidden sm:block">
              <Heart className="w-5 h-5" />
            </Link>
            
            <button 
              onClick={() => dispatch(toggleDrawer())} 
              className="text-white/70 hover:text-cyan-400 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 text-[#0b1114] text-[10px] flex items-center justify-center rounded-full font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
            
            <Link to="/profile" className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-[#0b1114] transition-all duration-300">
              <span className="font-bold text-xs">{user ? user.firstName.charAt(0).toUpperCase() : 'U'}</span>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-white z-50 relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-full left-0 right-0 glass border-t border-white/5 shadow-2xl md:hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-2xl font-bold text-white hover:text-cyan-400 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-4" />
              <Link to="/profile" className="flex items-center gap-3 text-lg font-bold text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <User className="w-6 h-6 text-cyan-400" /> Profile & Settings
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] bg-[#0b1114]/80 flex items-start justify-center pt-32 px-4"
          >
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
            <motion.form 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onSubmit={handleSearch}
              className="relative w-full max-w-3xl z-10"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-6 w-8 h-8 text-cyan-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  className="w-full bg-[#121b22] border border-white/10 text-white text-2xl placeholder-white/30 rounded-full py-6 pl-20 pr-16 shadow-[0_0_50px_rgba(6,182,212,0.15)] focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
                <button 
                  type="button" 
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-6 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-center text-white/50 mt-6 font-medium">Press Enter to search, or Esc to close</p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
