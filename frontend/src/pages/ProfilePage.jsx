import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Package, Heart, CreditCard, Bell, Settings, LogOut, Check, X, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectWishlistItems, toggleWishlist } from '../store/slices/wishlistSlice';
import { selectUser, logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import api from '../services/api';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: User },
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'payments', label: 'Saved Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleSignOut = () => {
    dispatch(logout());
    toast.success('Signed out successfully');
    navigate('/welcome');
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0">
            <Card className="p-4 sticky top-24">
              <div className="flex items-center gap-4 mb-6 p-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{user?.fullName || 'User'}</h3>
                  <p className="text-sm text-white/50">{user?.email || 'Loading...'}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-cyan-500/10 text-cyan-400' 
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card glass={false} className="p-5 flex flex-col items-center justify-center text-center bg-[#162028] border-white/5">
                      <Package className="w-8 h-8 text-cyan-400 mb-2" />
                      <span className="text-3xl font-bold text-white">
                        {isLoadingOrders ? <span className="animate-pulse">...</span> : orders.length}
                      </span>
                      <span className="text-sm text-white/50">Total Orders</span>
                    </Card>
                    <Card glass={false} className="p-5 flex flex-col items-center justify-center text-center bg-[#162028] border-white/5">
                      <Heart className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-3xl font-bold text-white">{wishlistItems.length}</span>
                      <span className="text-sm text-white/50">Wishlist Items</span>
                    </Card>
                    <Card glass={false} className="p-5 flex flex-col items-center justify-center text-center bg-[#162028] border-white/5">
                      <CreditCard className="w-8 h-8 text-purple-500 mb-2" />
                      <span className="text-3xl font-bold text-white">2</span>
                      <span className="text-sm text-white/50">Saved Cards</span>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 p-6 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <User className="w-32 h-32 text-cyan-400" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="font-semibold text-xl text-white mb-2">EuphoriaX VIP Status</h3>
                        <p className="text-white/70 text-sm mb-6 leading-relaxed">You are just 2 orders away from unlocking the <span className="font-bold text-cyan-400">Platinum Tier</span> and free express shipping for life.</p>
                        <div className="w-full bg-[#0b1114] rounded-full h-3 mb-3 overflow-hidden border border-white/5 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-white/50 font-bold uppercase tracking-widest">
                          <span className="text-cyan-400">Gold</span>
                          <span>Platinum</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="bg-[#162028] border-white/5 p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg text-white">Recent Activity</h3>
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setActiveTab('orders')}>View All</Button>
                      </div>
                      <div className="space-y-4 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">Added Silk Scarf to wishlist</p>
                            <p className="text-white/40 text-xs mt-0.5">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">Order #EU-74291 delivered</p>
                            <p className="text-white/40 text-xs mt-0.5">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Order History</h2>
                  {isLoadingOrders ? (
                    <div className="text-white/50 text-center py-12 animate-pulse">Loading your orders...</div>
                  ) : orders.length === 0 ? (
                    <Card className="min-h-[200px] flex flex-col items-center justify-center text-slate-500 bg-[#162028] border-white/5">
                      <Package className="w-12 h-12 text-slate-400/50 mb-4" />
                      <p>You haven't placed any orders yet.</p>
                      <Button onClick={() => navigate('/shop')} variant="outline" className="mt-4">Start Shopping</Button>
                    </Card>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id} className="p-6 border border-white/5 bg-[#162028]">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div>
                            <p className="text-cyan-400 font-bold mb-1">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-sm text-white/50">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {order.status || 'PROCESSING'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                          <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center text-white/30">
                            <Package className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{order.items?.length || 0} Items</p>
                            <p className="text-sm text-white/50">Total</p>
                          </div>
                          <p className="font-bold text-lg text-white">
                            ${order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">My Wishlist</h2>
                  {wishlistItems.length === 0 ? (
                    <Card className="min-h-[300px] flex flex-col items-center justify-center text-slate-500">
                      <Heart className="w-12 h-12 text-slate-400/50 mb-4" />
                      <p>Your wishlist is empty.</p>
                      <Button onClick={() => navigate('/shop')} variant="outline" className="mt-4">Explore Shop</Button>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlistItems.map((item) => (
                        <Card key={item.id} className="flex gap-4 p-4 border border-white/5 bg-[#162028]">
                          <img src={item.image || item.images?.[0]} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                          <div className="flex-1 flex flex-col justify-center">
                            <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{item.name}</h3>
                            <p className="text-cyan-400 font-bold mb-3">${item.price.toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="flex-1 text-xs h-8" onClick={() => {
                                // Assume add to cart logic here if we brought it in, but for now just navigate
                                navigate(`/product/${item.id}`);
                              }}>View</Button>
                              <button 
                                onClick={() => dispatch(toggleWishlist(item))}
                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Payments</h2>
                    <Button variant="outline" size="sm" onClick={() => toast.success('Add Card feature coming soon!')}>+ Add Card</Button>
                  </div>
                  <Card className="p-6 border border-white/5 bg-gradient-to-r from-blue-900/40 to-purple-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-20"><CreditCard className="w-24 h-24" /></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-8">
                        <span className="text-xl font-bold italic tracking-widest text-white/90">VISA</span>
                      </div>
                      <p className="text-2xl font-mono tracking-[0.2em] text-white mb-4">**** **** **** 4242</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Card Holder</p>
                          <p className="text-white font-medium tracking-wide">JOHN DOE</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Expires</p>
                          <p className="text-white font-medium tracking-wide">12/28</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Notifications</h2>
                  <Card className="p-0 overflow-hidden bg-[#162028] border-white/5">
                    <div className="p-4 border-b border-white/5 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Order Delivered</p>
                        <p className="text-sm text-white/60 mb-2">Your order #EU-847291 has been successfully delivered.</p>
                        <p className="text-xs text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> 2 hours ago</p>
                      </div>
                    </div>
                    <div className="p-4 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">Price Drop Alert</p>
                        <p className="text-sm text-white/60 mb-2">An item in your wishlist has dropped in price!</p>
                        <p className="text-xs text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> 1 day ago</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Account Settings</h2>
                  <Card className="p-6 bg-[#162028] border-white/5 space-y-6">
                    <h3 className="font-semibold text-lg text-white border-b border-white/10 pb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input label="First Name" defaultValue={user?.firstName || ''} />
                      <Input label="Last Name" defaultValue={user?.lastName || ''} />
                    </div>
                    <Input label="Email Address" type="email" defaultValue={user?.email || ''} readOnly />
                    <Input label="Phone Number" type="tel" defaultValue="" />
                    <div className="flex justify-end pt-4 border-t border-white/10 mt-6">
                      <Button onClick={() => toast.success('Profile updated successfully!')}>Save Changes</Button>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
