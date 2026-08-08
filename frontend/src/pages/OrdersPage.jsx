import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Package, Clock, Truck, FileText, ArrowRight, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageTransition from '../components/shared/PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

const OrderTimeline = ({ progress }) => {
  const steps = [
    { label: 'Order Placed', icon: Clock },
    { label: 'Processing', icon: Package },
    { label: 'Shipped', icon: Truck },
    { label: 'Delivered', icon: Check }
  ];

  return (
    <div className="relative mt-12 mb-8 px-4 sm:px-12">
      {/* Background Line */}
      <div className="absolute left-8 right-8 sm:left-16 sm:right-16 top-4 h-1.5 bg-white/10 rounded-full z-0" />
      
      {/* Active Line */}
      <div 
        className="absolute left-8 sm:left-16 top-4 h-1.5 bg-cyan-400 rounded-full z-0 transition-all duration-1000"
        style={{ width: `calc(${(progress - 1) / (steps.length - 1)} * (100% - 4rem))` }}
      />

      <div className="relative z-10 flex justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < progress;
          const isActive = idx === progress - 1;
          
          return (
            <div key={idx} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg
                  ${isCompleted 
                    ? 'bg-cyan-400 text-[#0b1114]' 
                    : 'bg-[#121b22] border-2 border-white/20 text-white/40'
                  }
                  ${isActive && !isCompleted ? 'border-cyan-400 text-cyan-400' : ''}
                `}
              >
                {isCompleted ? <Check className="w-5 h-5 font-bold" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className={`mt-4 text-xs font-bold text-center absolute top-10 whitespace-nowrap
                ${isCompleted || isActive ? 'text-white' : 'text-white/40'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector(selectUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return order.status !== 'DELIVERED';
    if (activeTab === 'completed') return order.status === 'DELIVERED';
    return true;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0b1114] py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header section matching reference image */}
          <div className="mb-12 relative p-8 rounded-3xl overflow-hidden glass-card border-none bg-gradient-to-r from-purple-900/40 to-blue-900/20">
            <div className="absolute top-0 left-0 w-64 h-1 bg-gradient-primary" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              My Orders & Tracking
            </h1>
            <p className="text-lg text-white/70">
              Inspect order histories, track live GPS shipments, and download verified tax invoices.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Orders (6)' },
              { id: 'active', label: 'Active & In Transit (4)' },
              { id: 'completed', label: 'Completed & Delivered (2)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-bold tracking-wide whitespace-nowrap relative transition-colors ${
                  activeTab === tab.id ? 'text-cyan-400' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="orders-tab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-t-md"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-white/50 text-center py-12 animate-pulse">Loading your orders...</div>
            ) : filteredOrders.length === 0 ? (
              <Card className="min-h-[300px] flex flex-col items-center justify-center text-slate-500 bg-[#121b22] border-white/5">
                <Package className="w-16 h-16 text-slate-400/50 mb-4" />
                <p className="text-lg">No orders found in this category.</p>
                <Button onClick={() => navigate('/shop')} variant="outline" className="mt-6">Explore the Shop</Button>
              </Card>
            ) : (
              filteredOrders.map((order, i) => {
                // Calculate progress based on status
                let progress = 1;
                let statusText = 'Order Placed & Processing';
                if (order.status === 'PAID') { progress = 2; statusText = 'Payment Received, Preparing for Shipment'; }
                if (order.status === 'SHIPPED') { progress = 3; statusText = 'Package currently in transit'; }
                if (order.status === 'DELIVERED') { progress = 4; statusText = 'Order Shipped & Delivered Successfully'; }

                const orderTotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card glass={false} className="bg-[#121b22] border-white/5 overflow-hidden">
                      
                      {/* Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex flex-wrap gap-8">
                          <div>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Order Number</p>
                            <p className="text-sm font-semibold text-white font-mono">{order.id.substring(0, 8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Date Placed</p>
                            <p className="text-sm font-semibold text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="text-lg font-bold text-cyan-400">${orderTotal.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                          {order.status === 'DELIVERED' ? (
                            <div className="px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <Check className="w-3.5 h-3.5" /> Delivered
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <Truck className="w-3.5 h-3.5" /> {order.status || 'PROCESSING'}
                            </div>
                          )}
                          <Button variant="secondary" size="sm" className="font-semibold px-4 h-10">
                            Order Details <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div className="p-6 pb-12">
                        <OrderTimeline progress={progress} />
                      </div>

                      {/* Order Footer */}
                      <div className="px-6 py-4 border-t border-white/5 bg-[#0b1114] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-white/40" />
                          <span className="text-white/60">Items:</span>
                          <span className="text-white font-bold tracking-wide">{order.items?.length || 0} Items Included</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/60">Status:</span>
                          <span className={order.status === 'DELIVERED' ? 'text-green-400 font-bold' : 'text-blue-400 font-bold'}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
