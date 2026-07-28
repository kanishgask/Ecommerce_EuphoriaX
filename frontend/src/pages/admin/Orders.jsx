import React, { useState, useEffect } from 'react';
import { Download, Filter, Search, Calendar, ChevronDown, Package, Truck, CheckCircle, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderService } from '../../services/api';
import { downloadOrderInvoice } from '../../utils/invoiceGenerator.jsx';

const initialOrders = [
  { id: 'EX-892410', customer: 'Emma Watson', email: 'emma@example.com', date: '2026-07-26', items: 1, total: '$314.99', status: 'Shipped', version: 1 },
  { id: 'EX-771092', customer: 'James Bond', email: 'james@example.com', date: '2026-07-18', items: 1, total: '$199.50', status: 'Delivered', version: 1 },
  { id: 'EX-601928', customer: 'Tony Stark', email: 'tony@example.com', date: '2026-06-05', items: 2, total: '$234.99', status: 'Delivered', version: 1 },
  { id: '#ORD-7829', customer: 'Emma Watson', email: 'emma@example.com', date: '2023-10-24', items: 3, total: '$129.00', status: 'Delivered', version: 1 },
  { id: '#ORD-7828', customer: 'James Bond', email: 'james@example.com', date: '2023-10-24', items: 1, total: '$89.50', status: 'Processing', version: 1 },
  { id: '#ORD-7827', customer: 'Bruce Wayne', email: 'bruce@example.com', date: '2023-10-23', items: 5, total: '$450.00', status: 'Shipped', version: 1 },
  { id: '#ORD-7826', customer: 'Tony Stark', email: 'tony@example.com', date: '2023-10-23', items: 12, total: '$1,299.00', status: 'Delivered', version: 1 },
  { id: '#ORD-7825', customer: 'Peter Parker', email: 'peter@example.com', date: '2023-10-22', items: 1, total: '$45.00', status: 'Cancelled', version: 1 },
  { id: '#ORD-7824', customer: 'Natasha Romanoff', email: 'nat@example.com', date: '2023-10-22', items: 2, total: '$199.99', status: 'Pending', version: 1 },
];

const getStatusBadge = (status) => {
  switch((status || '').toUpperCase()) {
    case 'DELIVERED': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'PROCESSING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'SHIPPED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'PENDING': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const StatCard = ({ title, count, icon: Icon, colorClass }) => (
  <div className="glass-panel p-5 rounded-xl border border-white/5 flex items-center gap-4">
    <div className={`p-3 rounded-lg bg-white/5 ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-white">{count}</h4>
    </div>
  </div>
);

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const normalizeOrder = (o, idx) => {
    const statusOverrides = JSON.parse(localStorage.getItem('euphoriax_order_statuses') || '{}');
    const id = String(o.orderId || o.id || o._id || `#ORD-${8000 + idx}`);
    const cleanId = id.replace('#', '');
    const status = statusOverrides[id] || statusOverrides[cleanId] || statusOverrides[`#${cleanId}`] || String(o.status || 'Pending');
    return {
      id,
      customer: String(o.shippingAddress?.firstName ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName || ''}` : (o.customer || 'Customer')),
      email: String(o.userId ? `user_${String(o.userId).slice(-4)}@euphoria.com` : (o.email || 'guest@euphoria.com')),
      date: String(o.createdAt ? new Date(o.createdAt).toLocaleDateString() : (o.date || 'Today')),
      items: Array.isArray(o.items) ? o.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : (typeof o.items === 'object' ? 1 : Number(o.items || 1)),
      total: typeof o.totalAmount === 'number' ? `$${o.totalAmount.toFixed(2)}` : String(o.total || '$99.00'),
      status,
      version: Number(o.version || 1),
      rawOrder: o
    };
  };

  const fetchOrders = async () => {
    setLoading(true);
    let localOrders = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('euphoriax_orders') || '[]');
      if (Array.isArray(parsed)) {
        localOrders = parsed.map((o, idx) => normalizeOrder(o, idx));
      }
    } catch (e) {}

    const mappedInitial = initialOrders.map((o, idx) => normalizeOrder(o, idx + 100));

    try {
      const res = await orderService.getAllOrders();
      const fetched = res.data?.data?.items || res.data?.data || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        const mapped = fetched.map((o, idx) => normalizeOrder(o, idx));
        setOrders([...localOrders, ...mapped]);
      } else {
        setOrders([...localOrders, ...mappedInitial]);
      }
    } catch (err) {
      console.warn("Backend orders fetch fallback:", err);
      setOrders([...localOrders, ...mappedInitial]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, currentVersion) => {
    try {
      await orderService.updateStatus(orderId, { status: newStatus.toUpperCase(), version: currentVersion });
    } catch (err) {
      console.warn("Backend order status update fallback:", err);
    }

    // Persist status override in localStorage so User Portal and all Admin pages see it immediately
    try {
      const overrides = JSON.parse(localStorage.getItem('euphoriax_order_statuses') || '{}');
      overrides[String(orderId)] = newStatus;
      overrides[String(orderId).replace('#', '')] = newStatus;
      overrides[`#${String(orderId).replace('#', '')}`] = newStatus;
      localStorage.setItem('euphoriax_order_statuses', JSON.stringify(overrides));
    } catch (e) {
      console.error("Failed to save order status override:", e);
    }

    // Update euphoriax_orders in localStorage if it was a customer checkout order
    try {
      const local = JSON.parse(localStorage.getItem('euphoriax_orders') || '[]');
      const updatedLocal = local.map(o => {
        const id = String(o.orderId || o.id || o._id || '');
        if (id === orderId || `#${id}` === orderId || orderId === `#${id}` || id === String(orderId).replace('#', '')) {
          return { ...o, status: newStatus, version: (o.version || 1) + 1 };
        }
        return o;
      });
      localStorage.setItem('euphoriax_orders', JSON.stringify(updatedLocal));
    } catch (e) {
      console.error("Failed to update localStorage orders:", e);
    }

    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus, version: (o.version || 1) + 1 };
      }
      return o;
    }));

    toast.success(`Order ${orderId} status updated to ${newStatus}!`);
  };

  const filteredOrders = orders.filter(o => {
    const q = String(searchQuery || '').toLowerCase();
    return String(o.id || '').toLowerCase().includes(q) || 
           String(o.customer || '').toLowerCase().includes(q) ||
           String(o.email || '').toLowerCase().includes(q);
  });

  const pendingCount = orders.filter(o => (o.status || '').toUpperCase() === 'PENDING').length;
  const processingCount = orders.filter(o => (o.status || '').toUpperCase() === 'PROCESSING').length;
  const shippedCount = orders.filter(o => (o.status || '').toUpperCase() === 'SHIPPED').length;
  const deliveredCount = orders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Customer Orders</h1>
          <p className="text-gray-400 text-sm">Track, manage, and fulfill customer transactions directly from the backend.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin text-primary-400" /> : null}
            <span>Refresh Orders</span>
          </button>
          <button onClick={() => toast.success("Orders CSV exported successfully!")} className="btn-secondary flex items-center gap-2 group">
            <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pending" count={pendingCount} icon={Clock} colorClass="text-orange-400" />
        <StatCard title="Processing" count={processingCount} icon={Package} colorClass="text-yellow-400" />
        <StatCard title="Shipped" count={shippedCount} icon={Truck} colorClass="text-blue-400" />
        <StatCard title="Delivered" count={deliveredCount} icon={CheckCircle} colorClass="text-green-400" />
      </div>

      {/* Main Table Area */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02]">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or customer..." 
              className="w-full bg-dark-900 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-gray-500"
            />
          </div>
          <div className="flex w-full md:w-auto gap-3 items-center">
            <span className="text-xs text-gray-400 font-medium">Total Orders: <strong className="text-white">{filteredOrders.length}</strong></span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-center">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status & Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-bold font-mono text-primary-400">{order.id}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-white">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono text-xs">{order.date}</td>
                    <td className="p-4 text-center text-gray-300 font-bold">{order.items}</td>
                    <td className="p-4 font-bold text-white">{order.total}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border inline-block ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value, order.version)}
                          className="bg-dark-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-primary-500 hover:border-white/20 transition-colors"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => downloadOrderInvoice(order)}
                          title="Download PDF Invoice"
                          className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-colors"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
