import React from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Mail, Shield, Calendar, Clock, CreditCard, MapPin } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-black mb-8 text-white">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary-600 to-purple-600 opacity-20"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-primary-500/30 border-4 border-dark-900 mb-4">
                {user?.name?.charAt(0) || 'U'}
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1">{user?.name || 'User'}</h2>
              <div className="flex items-center justify-center text-gray-400 text-sm mb-4 gap-1.5">
                <Mail size={14} />
                <span>{user?.email}</span>
              </div>
              
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-primary-400">
                <Shield size={12} />
                <span>{user?.role === 'ADMIN' ? 'Administrator' : 'Standard Customer'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Account Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">User ID</label>
                <div className="text-gray-300 font-mono text-sm bg-dark-950 p-3 rounded-xl border border-white/5 truncate">
                  {user?.id || 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">Member Since</label>
                <div className="text-gray-300 text-sm bg-dark-950 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                  <Calendar size={16} className="text-primary-500" />
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Settings & Preferences</h3>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-dark-950 rounded-xl border border-white/5 hover:border-white/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/20 transition-colors">
                    <MapPin size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Shipping Addresses</p>
                    <p className="text-xs text-gray-400">Manage your delivery locations</p>
                  </div>
                </div>
                <div className="text-gray-500 group-hover:text-white transition-colors">?</div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-dark-950 rounded-xl border border-white/5 hover:border-white/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors">
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Payment Methods</p>
                    <p className="text-xs text-gray-400">Manage your saved cards</p>
                  </div>
                </div>
                <div className="text-gray-500 group-hover:text-white transition-colors">?</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
