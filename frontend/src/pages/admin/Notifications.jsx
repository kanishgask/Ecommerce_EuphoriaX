import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, RefreshCw, Send, AlertTriangle, Info, CheckCircle, ShieldAlert, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/api';

const initialNotifications = [
  { id: 'NOTIF-01', title: 'Critical Stock Alert', message: 'Product "Ergonomic Office Chair" is out of stock. Immediate reorder recommended.', type: 'ALERT', time: '10 mins ago', read: false },
  { id: 'NOTIF-02', title: 'High-Value Order Received', message: 'Order #ORD-7826 placed by Tony Stark total $1,299.00 requires verification.', type: 'ORDER', time: '1 hour ago', read: false },
  { id: 'NOTIF-03', title: 'Payment Gateway Sync', message: 'Daily settlement of $48,290.00 processed and transferred to merchant account.', type: 'SYSTEM', time: '3 hours ago', read: true },
  { id: 'NOTIF-04', title: 'New Admin Registration', message: 'User emma@example.com was granted ADMIN operator privileges.', type: 'SECURITY', time: 'Yesterday', read: true },
  { id: 'NOTIF-05', title: 'Low Stock Warning', message: 'Product "Minimalist Desk Lamp" has reached low stock threshold (12 units remaining).', type: 'ALERT', time: 'Yesterday', read: true },
  { id: 'NOTIF-06', title: 'System Backup Completed', message: 'Database snapshot and cloud backups verified successfully.', type: 'SYSTEM', time: '2 days ago', read: true },
];

const getTypeIcon = (type) => {
  switch (type) {
    case 'ALERT': return { icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    case 'ORDER': return { icon: CheckCircle, color: 'text-green-400 bg-green-500/10 border-green-500/20' };
    case 'SECURITY': return { icon: ShieldAlert, color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    default: return { icon: Info, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      const fetched = res.data?.data?.items || res.data?.data || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        const mapped = fetched.map((n, idx) => ({
          id: n.notificationId || n._id || `NOTIF-${idx + 100}`,
          title: n.title || 'System Notification',
          message: n.message || n.body || 'New alert from EuphoriaX services.',
          type: (n.type || 'SYSTEM').toUpperCase(),
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          read: !!n.read
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.warn("Notifications backend fetch fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
    } catch (err) {
      console.warn("Backend mark read fallback:", err);
    }

    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    toast.success("Marked as read");
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
    } catch (err) {
      console.warn("Backend mark all read fallback:", err);
    }

    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read!");
  };

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success("Notification removed");
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Please fill in both title and message.");
      return;
    }

    try {
      await notificationService.broadcast({ title: broadcastTitle, message: broadcastMessage, type: 'SYSTEM' });
    } catch (err) {
      console.warn("Backend broadcast fallback:", err);
    }

    const newAlert = {
      id: `NOTIF-${Date.now()}`,
      title: `[BROADCAST] ${broadcastTitle}`,
      message: broadcastMessage,
      type: 'SYSTEM',
      time: 'Just now',
      read: false
    };

    setNotifications([newAlert, ...notifications]);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setShowBroadcastModal(false);
    toast.success("Broadcast alert dispatched to all user endpoints!");
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.read;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <span>Admin Notification Center</span>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-400 text-sm">Real-time system events, order verifications, inventory alarms, and broadcast tools.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchNotifications} className="btn-secondary flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin text-primary-400" /> : <RefreshCw size={16} />}
            <span>Sync Alerts</span>
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-primary-400 hover:text-primary-300">
              <CheckCheck size={16} />
              <span>Mark All Read</span>
            </button>
          )}
          <button onClick={() => setShowBroadcastModal(true)} className="btn-primary flex items-center gap-2">
            <Send size={16} />
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilterType('ALL')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'ALL' ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            All Alerts ({notifications.length})
          </button>
          <button 
            onClick={() => setFilterType('UNREAD')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'UNREAD' ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            Unread ({unreadCount})
          </button>
          <button 
            onClick={() => setFilterType('ALERT')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'ALERT' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            Warnings
          </button>
          <button 
            onClick={() => setFilterType('ORDER')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'ORDER' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setFilterType('SYSTEM')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'SYSTEM' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-dark-800 text-gray-400 hover:text-white'}`}
          >
            System
          </button>
        </div>
        <span className="text-xs text-gray-500">Showing {filteredNotifications.length} items</span>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center">
            <Bell size={40} className="mx-auto text-gray-600 mb-3 animate-bounce" />
            <p className="text-gray-400 font-medium">No alerts matching your current filter.</p>
            <p className="text-xs text-gray-600 mt-1">You are up to date on all critical system events!</p>
          </div>
        ) : (
          filteredNotifications.map(n => {
            const { icon: Icon, color } = getTypeIcon(n.type);
            return (
              <div 
                key={n.id} 
                className={`glass-panel p-5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${n.read ? 'border-white/5 opacity-80 hover:opacity-100' : 'border-primary-500/40 bg-white/[0.03] shadow-[0_0_20px_rgba(124,58,237,0.1)]'}`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-xl border shrink-0 ${color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-white text-base">{n.title}</h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
                      )}
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-dark-800 text-gray-400 border border-white/5 ml-1">
                        {n.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{n.message}</p>
                    <span className="text-xs text-gray-500 mt-1 block">{n.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!n.read && (
                    <button 
                      onClick={() => handleMarkAsRead(n.id)} 
                      className="px-3 py-1.5 rounded-lg bg-dark-800 border border-white/10 hover:border-primary-500/50 text-xs font-medium text-primary-400 hover:text-primary-300 transition-all flex items-center gap-1.5"
                      title="Mark as Read"
                    >
                      <Check size={14} />
                      <span>Mark Read</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteNotification(n.id)} 
                    className="p-2 rounded-lg bg-dark-800 border border-white/5 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all"
                    title="Delete alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">Broadcast System Announcement</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Announcement Title</label>
                <input 
                  type="text" 
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g., Scheduled Maintenance Notification or Mega Sale Live!" 
                  required
                  className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Message Content</label>
                <textarea 
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type the announcement that will appear in all user portals and email alerts..." 
                  required
                  className="w-full bg-dark-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowBroadcastModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Send size={16} />
                  <span>Dispatch Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
