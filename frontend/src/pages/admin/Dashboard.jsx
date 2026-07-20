import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

const salesData = [
  { name: 'Jan', revenue: 4000, orders: 240 },
  { name: 'Feb', revenue: 3000, orders: 139 },
  { name: 'Mar', revenue: 2000, orders: 980 },
  { name: 'Apr', revenue: 2780, orders: 390 },
  { name: 'May', revenue: 1890, orders: 480 },
  { name: 'Jun', revenue: 2390, orders: 380 },
  { name: 'Jul', revenue: 3490, orders: 430 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Home', value: 300 },
  { name: 'Sports', value: 200 },
];
const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'];

const DashboardCard = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="glass-panel p-6 rounded-2xl flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
        <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
      </div>
      <span className={`text-sm font-semibold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trend}
      </span>
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Total Revenue" value="$45,231.89" icon={DollarSign} trend="+20.1%" trendUp={true} />
        <DashboardCard title="Total Orders" value="2,350" icon={ShoppingBag} trend="+15.2%" trendUp={true} />
        <DashboardCard title="Active Users" value="12,450" icon={Users} trend="+5.4%" trendUp={true} />
        <DashboardCard title="Conversion Rate" value="3.24%" icon={TrendingUp} trend="-1.2%" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Sales by Category</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-800 rounded-t-lg">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium">#ORD-{9876 + item}</td>
                  <td className="px-6 py-4">John Doe {item}</td>
                  <td className="px-6 py-4">Oct {item}, 2023</td>
                  <td className="px-6 py-4">${(120.50 * item).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                      Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
