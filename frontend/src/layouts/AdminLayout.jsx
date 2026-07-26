import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Box, 
  ShoppingCart, 
  CreditCard, 
  Users, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Inventory', path: '/admin/inventory', icon: Box },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Payments', path: '/admin/payments', icon: CreditCard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Notifications', path: '/admin/notifications', icon: Bell },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-dark-900 text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${collapsed ? 'w-20' : 'w-64'} flex flex-col bg-dark-950 border-r border-white/5 transition-all duration-300 z-20 relative`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
          {!collapsed && (
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                E
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                EuphoriaX
              </span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]">
              E
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors ${collapsed ? 'absolute -right-3 top-5 bg-dark-800 border border-white/10 rounded-full' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
          <div className="mb-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {!collapsed && 'Main Menu'}
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-primary-600/10 text-primary-500' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                title={collapsed ? item.name : ''}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-400 to-primary-600 rounded-r-md"></div>
                )}
                <Icon size={20} className={isActive ? 'text-primary-500' : 'group-hover:text-white'} />
                {!collapsed && <span className="font-medium text-sm">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group`} onClick={handleLogout}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm shrink-0 shadow-lg border border-white/10">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400 truncate">Log out</p>
              </div>
            )}
            {!collapsed && <LogOut size={16} className="text-gray-500 group-hover:text-red-400 transition-colors" />}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-dark-900">
        {/* Top Header */}
        <header className="h-16 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-10 sticky top-0">
          {/* Breadcrumb / Search */}
          <div className="flex items-center gap-6 flex-1">
            <div className="hidden md:flex items-center text-sm text-gray-400">
              <span>Admin</span>
              <ChevronRight size={14} className="mx-1" />
              <span className="text-white capitalize font-medium">{location.pathname.split('/').pop() || 'Dashboard'}</span>
            </div>
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-dark-800 border border-white/10 text-white rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-500"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              target="_blank"
              className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink size={16} />
              <span>View Store</span>
            </Link>
            
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>
            
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-dark-900"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
