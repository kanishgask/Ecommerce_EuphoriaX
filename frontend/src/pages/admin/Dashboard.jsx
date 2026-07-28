import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Activity,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { orderService, productService } from '../../services/api';

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 },
  { name: 'Sat', revenue: 8390 },
  { name: 'Sun', revenue: 10490 },
];

const COLORS = ['#7c3aed', '#3b82f6', '#f59e0b', '#10b981'];

const getStatusColor = (status) => {
  switch((status || '').toUpperCase()) {
    case 'DELIVERED': return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'PROCESSING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'SHIPPED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, isPositive }) => (
  <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors animate-slide-up">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
      </div>
      <div className="p-3 bg-white/5 rounded-xl text-primary-400">
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
        {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
        {trendValue}
      </span>
      <span className="text-gray-500 text-xs">{trend}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const [stats, setStats] = useState({
    totalRevenue: '$48,290',
    totalOrders: '1,249',
    activeUsers: '8,943',
    conversionRate: '3.42%'
  });

  const [recentOrders, setRecentOrders] = useState([
    { id: '#ORD-001', customer: 'Emma Watson', date: '2 mins ago', amount: '$129.00', status: 'Delivered' },
    { id: '#ORD-002', customer: 'James Bond', date: '1 hour ago', amount: '$89.50', status: 'Processing' },
    { id: '#ORD-003', customer: 'Bruce Wayne', date: '3 hours ago', amount: '$450.00', status: 'Shipped' },
    { id: '#ORD-004', customer: 'Tony Stark', date: '5 hours ago', amount: '$1,299.00', status: 'Delivered' },
    { id: '#ORD-005', customer: 'Peter Parker', date: '1 day ago', amount: '$45.00', status: 'Cancelled' },
  ]);

  const [categoryData, setCategoryData] = useState([
    { name: 'Electronics', value: 400 },
    { name: 'Fashion', value: 300 },
    { name: 'Home & Living', value: 300 },
    { name: 'Sports', value: 200 },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    let localOrders = [];
    try {
      localOrders = JSON.parse(localStorage.getItem('euphoriax_orders') || '[]');
    } catch (e) {}

    try {
      const [ordRes, prodRes] = await Promise.all([
        orderService.getAllOrders().catch(() => null),
        productService.getAll().catch(() => null)
      ]);

      const ords = ordRes?.data ? (ordRes.data.data?.items || ordRes.data.data || ordRes.data || []) : [];
      const combinedOrds = [...localOrders, ...(Array.isArray(ords) ? ords : [])];

      if (combinedOrds.length > 0) {
        const sumRev = combinedOrds.reduce((acc, o) => {
          const val = typeof o.totalAmount === 'number' ? o.totalAmount : parseFloat(String(o.total || '0').replace(/[^0-9.-]+/g,"")) || 0;
          return acc + val;
        }, 0);
        setStats(prev => ({
          ...prev,
          totalRevenue: `$${sumRev > 0 ? sumRev.toLocaleString(undefined, {minimumFractionDigits: 2}) : '48,290.00'}`,
          totalOrders: combinedOrds.length.toLocaleString()
        }));

        const statusOverrides = JSON.parse(localStorage.getItem('euphoriax_order_statuses') || '{}');
        const mappedRecent = combinedOrds.slice(0, 5).map((o, idx) => {
          const id = String(o.orderId || o.id || o._id || `#ORD-${900 + idx}`);
          const cleanId = id.replace('#', '');
          const status = statusOverrides[id] || statusOverrides[cleanId] || statusOverrides[`#${cleanId}`] || String(o.status || 'Pending');
          return {
            id,
            customer: String(o.shippingAddress?.firstName ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName || ''}` : (o.customer || 'Customer')),
            date: String(o.createdAt ? new Date(o.createdAt).toLocaleDateString() : (o.date || 'Recent')),
            amount: typeof o.totalAmount === 'number' ? `$${o.totalAmount.toFixed(2)}` : String(o.total || '$99.00'),
            status
          };
        });
        setRecentOrders(mappedRecent);
      } else {
        const statusOverrides = JSON.parse(localStorage.getItem('euphoriax_order_statuses') || '{}');
        setRecentOrders(prev => prev.map(o => {
          const id = String(o.id);
          const cleanId = id.replace('#', '');
          const status = statusOverrides[id] || statusOverrides[cleanId] || statusOverrides[`#${cleanId}`] || o.status;
          return { ...o, status };
        }));
      }

      if (prodRes?.data) {
        const prods = prodRes.data.data?.items || prodRes.data.data || prodRes.data || [];
        if (Array.isArray(prods) && prods.length > 0) {
          const catCounts = {};
          prods.forEach(p => {
            const cat = String(p.category || 'Electronics');
            catCounts[cat] = (catCounts[cat] || 0) + 1;
          });
          const newCatData = Object.keys(catCounts).map(k => ({ name: k, value: catCounts[k] }));
          if (newCatData.length > 0) setCategoryData(newCatData);
        }
      }
    } catch (err) {
      console.warn("Dashboard data fetch fallback:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome back, Admin 👋</h1>
          <p className="text-gray-400">Here's what's happening with your store today, {date}.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchDashboardData} className="btn-secondary">Refresh Stats</button>
          <button onClick={() => navigate('/admin/products')} className="btn-primary">Add Product</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon={DollarSign} trend="vs last week" trendValue="+12.5%" isPositive={true} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} trend="vs last week" trendValue="+8.2%" isPositive={true} />
        <StatCard title="Active Users" value={stats.activeUsers} icon={Users} trend="vs last week" trendValue="-2.4%" isPositive={false} />
        <StatCard title="Conversion Rate" value={stats.conversionRate} icon={Activity} trend="vs last week" trendValue="+1.1%" isPositive={true} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
              <p className="text-sm text-gray-400">Sales performance over time</p>
            </div>
            <select className="bg-dark-800 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff10', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Sales by Category</h3>
            <p className="text-sm text-gray-400">Distribution of catalog</p>
          </div>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-xs text-gray-400">Categories</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {categoryData.map((item, index) => (
               <div key={item.name} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 <span className="text-xs text-gray-300">{item.name}</span>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{order.id}</td>
                    <td className="p-4 text-gray-300">{order.customer}</td>
                    <td className="p-4 text-gray-400">{order.date}</td>
                    <td className="p-4 font-medium text-white">{order.amount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5">
           <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
           <div className="space-y-3">
             <button onClick={() => navigate('/admin/payments')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/30 transition-all text-left group">
               <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg group-hover:scale-110 transition-transform"><DollarSign size={18} /></div>
               <div>
                 <p className="text-sm font-bold text-white">Manage Payments</p>
                 <p className="text-xs text-gray-400">Inspect settlements & refunds</p>
               </div>
             </button>
             <button onClick={() => navigate('/admin/products')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left group">
               <div className="p-2 bg-primary-500/20 text-primary-400 rounded-lg group-hover:scale-110 transition-transform"><Package size={18} /></div>
               <div>
                 <p className="text-sm font-medium text-white">Manage Products</p>
                 <p className="text-xs text-gray-400">Edit price, stock & details</p>
               </div>
             </button>
             <button onClick={() => navigate('/admin/users')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-left group">
               <div className="p-2 bg-green-500/20 text-green-400 rounded-lg group-hover:scale-110 transition-transform"><Users size={18} /></div>
               <div>
                 <p className="text-sm font-medium text-white">User & Role Security</p>
                 <p className="text-xs text-gray-400">Verify customer accounts & admins</p>
               </div>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
