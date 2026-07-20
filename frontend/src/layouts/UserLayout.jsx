import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Package, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import CartDrawer from '../components/CartDrawer';

const UserLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openCart, getCartCount } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-900 transition-colors">
      <header className="sticky top-0 z-50 glass-panel border-b-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-500 tracking-tight">
                EuphoriaX
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/products" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors">Shop</Link>
                <Link to="/categories" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors">Categories</Link>
                <Link to="/about" className="text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors">About</Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 dark:bg-dark-800 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm transition-all outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              
              <button 
                onClick={openCart}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative"
              >
                <ShoppingBag className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-primary-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
              
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 p-2 text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors">
                    <User className="h-6 w-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700">Orders</Link>
                    {user?.role === 'ADMIN' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:bg-gray-100 dark:hover:bg-dark-700">Admin Portal</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm px-4 py-2">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow animate-fade-in">
        <Outlet />
      </main>
      
      <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Package className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">EuphoriaX</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">© {new Date().getFullYear()} EuphoriaX Store. All rights reserved.</p>
        </div>
      </footer>
      <CartDrawer />
    </div>
  );
};

export default UserLayout;
