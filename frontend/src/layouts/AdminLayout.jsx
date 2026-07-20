import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  CreditCard,
  Bell,
  LogOut,
  Settings,
  BarChart3
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Inventory', path: '/admin/inventory', icon: BarChart3 },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r-0 shadow-lg flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-primary-600 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Admin Portal</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center p-4 rounded-xl bg-gray-100 dark:bg-dark-800 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center font-bold mr-3">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 glass-panel border-b-0 shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold capitalize">
            {location.pathname.split('/').pop().replace('-', ' ')}
          </h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 relative">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
              View Store
            </Link>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8 bg-gray-50/50 dark:bg-dark-900 animate-slide-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
