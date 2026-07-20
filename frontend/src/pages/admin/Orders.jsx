import React from 'react';
import { Eye, Edit2, FileText } from 'lucide-react';

const AdminOrders = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders Management</h2>
        <button className="btn-primary flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-800">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <tr key={item} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-800/50 transition-colors">
                <td className="px-6 py-4 font-medium">#ORD-{5000 + item}</td>
                <td className="px-6 py-4">2023-10-{item.toString().padStart(2, '0')}</td>
                <td className="px-6 py-4">Jane Smith {item}</td>
                <td className="px-6 py-4">${(150.75 * item).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item % 3 === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                    item % 2 === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {item % 3 === 0 ? 'Pending' : item % 2 === 0 ? 'Shipped' : 'Delivered'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
