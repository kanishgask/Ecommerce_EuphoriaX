import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, AlertCircle, ArrowRight, ShoppingBag, MapPin, CreditCard, Download, ExternalLink, RefreshCw, Loader2, ShieldCheck, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { downloadOrderInvoice } from '../utils/invoiceGenerator.jsx';

const MOCK_ORDERS = [
  {
    id: 'EX-892410',
    date: 'July 26, 2026',
    status: 'SHIPPED',
    total: '$314.99',
    paymentMethod: 'Credit Card (•••• 4242)',
    trackingNumber: 'UPS-9928104912-US',
    estimatedDelivery: 'Tomorrow by 8:00 PM',
    shippingAddress: '742 Evergreen Terrace, Seattle, WA 98101, USA',
    items: [
      {
        id: 'f1',
        name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        price: 299.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
        category: 'Electronics'
      }
    ],
    step: 3 // 1: Placed, 2: Processing, 3: Shipped, 4: Delivered
  },
  {
    id: 'EX-771092',
    date: 'July 18, 2026',
    status: 'DELIVERED',
    total: '$199.50',
    paymentMethod: 'Apple Pay / Credit Card',
    trackingNumber: 'FEDEX-449102831-US',
    estimatedDelivery: 'Delivered on July 20, 2026',
    shippingAddress: '742 Evergreen Terrace, Seattle, WA 98101, USA',
    items: [
      {
        id: 'f2',
        name: 'Minimalist Titanium Smart Watch Series 9',
        price: 199.50,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
        category: 'Electronics'
      }
    ],
    step: 4
  },
  {
    id: 'EX-601928',
    date: 'June 05, 2026',
    status: 'DELIVERED',
    total: '$234.99',
    paymentMethod: 'Credit Card (•••• 4242)',
    trackingNumber: 'UPS-1102938471-US',
    estimatedDelivery: 'Delivered on June 08, 2026',
    shippingAddress: '742 Evergreen Terrace, Seattle, WA 98101, USA',
    items: [
      {
        id: 'f3',
        name: 'Urban Heavyweight Denim Jacket & Sherpa Collar',
        price: 89.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop',
        category: 'Fashion'
      },
      {
        id: 'f6',
        name: 'Designer Leather Weekender Duffel Bag',
        price: 145.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
        category: 'Fashion'
      }
    ],
    step: 4
  }
];

const getStatusBadge = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'DELIVERED': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'SHIPPED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'PROCESSING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  }
};

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, ACTIVE, DELIVERED
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    let localOrders = [];
    try {
      localOrders = JSON.parse(localStorage.getItem('euphoriax_orders') || '[]');
    } catch (e) {}

    try {
      const res = await orderService.getMyOrders();
      const fetched = res.data?.data?.items || res.data?.data || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        const mapped = fetched.map((o, idx) => {
          const fallback = MOCK_ORDERS[idx % MOCK_ORDERS.length];
          return {
            id: o.orderId || o.id || o._id || `EX-${800000 + idx}`,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (o.date || fallback.date),
            status: (o.status || fallback.status).toUpperCase(),
            total: typeof o.totalAmount === 'number' ? `$${o.totalAmount.toFixed(2)}` : (o.total || fallback.total),
            paymentMethod: o.paymentMethod || fallback.paymentMethod,
            trackingNumber: o.trackingNumber || fallback.trackingNumber,
            estimatedDelivery: o.estimatedDelivery || fallback.estimatedDelivery,
            shippingAddress: o.shippingAddress?.line1 ? `${o.shippingAddress.line1}, ${o.shippingAddress.city}, ${o.shippingAddress.state}` : (typeof o.shippingAddress === 'string' ? o.shippingAddress : fallback.shippingAddress),
            items: o.items || fallback.items,
            step: o.status === 'DELIVERED' ? 4 : o.status === 'SHIPPED' ? 3 : o.status === 'PROCESSING' ? 2 : 1
          };
        });
        setOrders([...localOrders, ...mapped]);
      } else {
        setOrders([...localOrders, ...MOCK_ORDERS]);
      }
    } catch (err) {
      console.warn("My orders API fallback to local mock orders:", err);
      setOrders([...localOrders, ...MOCK_ORDERS]);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addItem({
        productId: item.id || item.productId,
        name: item.name,
        price: item.price || 99.00,
        images: [item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'],
        category: item.category || 'General'
      }, item.quantity || 1);
    });
    toast.success(`Added ${order.items.length} item(s) from Order #${order.id} to your shopping bag!`);
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ACTIVE') return o.status !== 'DELIVERED' && o.status !== 'CANCELLED';
    if (activeTab === 'DELIVERED') return o.status === 'DELIVERED';
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-950 text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Banner */}
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-r from-purple-950/60 via-dark-900 to-indigo-950/60 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/20 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Package size={13} /> EuphoriaX Logistics Network
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              My Orders & Tracking
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2">
              Inspect order histories, track live GPS shipments, and download verified tax invoices.
            </p>
          </div>
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 relative z-10 shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin text-primary-400" /> : <RefreshCw size={16} />}
            <span>Sync Shipments</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex border-b border-white/10 gap-8">
          <button 
            onClick={() => setActiveTab('ALL')} 
            className={`pb-4 font-bold text-sm transition-all relative ${activeTab === 'ALL' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
          >
            All Orders ({orders.length})
            {activeTab === 'ALL' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('ACTIVE')} 
            className={`pb-4 font-bold text-sm transition-all relative ${activeTab === 'ACTIVE' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
          >
            Active & In Transit ({orders.filter(o => o.status !== 'DELIVERED').length})
            {activeTab === 'ACTIVE' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('DELIVERED')} 
            className={`pb-4 font-bold text-sm transition-all relative ${activeTab === 'DELIVERED' ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}
          >
            Completed & Delivered ({orders.filter(o => o.status === 'DELIVERED').length})
            {activeTab === 'DELIVERED' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full" />}
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(n => <div key={n} className="h-64 bg-dark-900 rounded-3xl animate-pulse border border-white/5" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl text-center border border-white/10 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-500">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Orders Found</h3>
            <p className="text-gray-400 text-sm mb-6">You don't have any orders matching this filter yet. Explore our premium catalog to start shopping!</p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
              <ShoppingBag size={18} />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-3xl border border-white/10 overflow-hidden bg-dark-900/90 shadow-xl hover:border-white/20 transition-all"
              >
                {/* Order Header Bar */}
                <div className="p-6 bg-dark-950/60 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-400 block text-xs">ORDER NUMBER</span>
                      <strong className="text-white font-mono font-bold text-base">{order.id}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">DATE PLACED</span>
                      <span className="text-gray-200">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-xs">TOTAL AMOUNT</span>
                      <strong className="text-amber-400 font-bold text-base">{order.total}</strong>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)} flex items-center gap-1.5`}>
                      {order.status === 'DELIVERED' ? <CheckCircle2 size={14} /> : <Truck size={14} className="animate-bounce" />}
                      <span>{order.status}</span>
                    </span>
                    <button 
                      onClick={() => setSelectedOrder(order)} 
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all flex items-center gap-1"
                    >
                      <span>Order Details</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Tracking Step Bar */}
                <div className="p-6 bg-dark-900/40 border-b border-white/5">
                  <div className="max-w-2xl mx-auto py-4">
                    <div className="flex items-center justify-between relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-dark-800 rounded-full z-0" />
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-primary-600 to-green-500 rounded-full z-0 transition-all duration-500" 
                        style={{ width: `${((order.step - 1) / 3) * 100}%` }}
                      />
                      
                      {[
                        { step: 1, label: 'Order Placed' },
                        { step: 2, label: 'Processing' },
                        { step: 3, label: 'Shipped (In Transit)' },
                        { step: 4, label: 'Delivered' }
                      ].map((s) => {
                        const isDone = order.step >= s.step;
                        const isCurr = order.step === s.step;
                        return (
                          <div key={s.step} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isDone ? 'bg-gradient-to-r from-primary-600 to-green-500 border-green-400 text-white shadow-lg' : 'bg-dark-950 border-dark-700 text-gray-500'}`}>
                              {isDone ? '✓' : s.step}
                            </div>
                            <span className={`text-[11px] font-bold mt-2 ${isCurr ? 'text-amber-400' : isDone ? 'text-gray-300' : 'text-gray-600'} hidden sm:block`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-2">
                    <Truck size={14} className="text-primary-400" />
                    <span>Tracking Number: <strong className="text-white font-mono">{order.trackingNumber}</strong></span>
                    <span>•</span>
                    <span>Status: <strong className="text-green-400">{order.estimatedDelivery}</strong></span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-6 divide-y divide-white/5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-2xl object-cover bg-dark-950 border border-white/10 p-1" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-primary-400 px-2 py-0.5 rounded bg-primary-500/10 border border-primary-500/20">{item.category || 'Item'}</span>
                          <h4 className="font-bold text-white text-base mt-1 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-400">Qty: <strong className="text-white">{item.quantity}</strong> × ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Link to={`/products/${item.id}`} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors">
                          View Item
                        </Link>
                        <button 
                          onClick={() => handleReorder(order)} 
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-xs font-extrabold text-white shadow transition-all flex items-center gap-1.5"
                        >
                          <ShoppingBag size={13} />
                          <span>Buy Again</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-dark-950/40 border-t border-white/5 flex flex-wrap justify-between items-center gap-4 text-xs">
                  <div className="text-gray-400 flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary-400" />
                    <span>Shipping to: <strong className="text-gray-300">{order.shippingAddress}</strong></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => downloadOrderInvoice(order)}
                      className="text-primary-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Download size={13} /> Invoice PDF
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => toast.success(`Connecting to 24/7 Priority Logistics Support for ${order.id}...`)}
                      className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <HelpCircle size={13} /> Need Help?
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-white/10 shadow-2xl bg-dark-900 animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white">Order Shipment Manifest</h3>
                <p className="text-xs text-gray-400 font-mono">ID: {selectedOrder.id} • Placed on {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-dark-950/60 border border-white/5">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block">Carrier & Tracking</span>
                  <strong className="text-white font-mono">{selectedOrder.trackingNumber}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block">Payment Method</span>
                  <span className="text-gray-200 flex items-center gap-1 mt-0.5"><CreditCard size={13} className="text-amber-400" /> {selectedOrder.paymentMethod}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><MapPin size={16} className="text-primary-400" /> Destination Address</h4>
                <p className="p-3 rounded-xl bg-white/5 text-gray-300 text-xs leading-relaxed border border-white/5">{selectedOrder.shippingAddress}</p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Package size={16} className="text-primary-400" /> Included Items ({selectedOrder.items.length})</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover bg-dark-950" />
                        <div>
                          <p className="font-bold text-white">{it.name}</p>
                          <p className="text-gray-400">Qty: {it.quantity}</p>
                        </div>
                      </div>
                      <strong className="text-amber-400 font-mono">${typeof it.price === 'number' ? (it.price * it.quantity).toFixed(2) : it.price}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-950/40 to-dark-950 border border-primary-500/20 flex justify-between items-center font-bold">
                <span className="text-gray-300">Total Charged Amount</span>
                <span className="text-2xl font-black text-white font-mono">{selectedOrder.total}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-3 justify-end items-center">
              <button 
                onClick={() => downloadOrderInvoice(selectedOrder)}
                className="btn-secondary px-5 text-xs flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20"
              >
                <Download size={14} /> Download PDF Invoice
              </button>
              <button 
                onClick={() => { handleReorder(selectedOrder); setSelectedOrder(null); }}
                className="btn-primary px-6 text-xs"
              >
                Reorder Entire Shipment
              </button>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary px-6 text-xs">Close Manifest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
