import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Layers, ShoppingCart, CreditCard,
  Users, Bell, LogOut, Search, Menu, X, Store, ChevronRight
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Dashboard',     path: '/admin',              icon: LayoutDashboard },
  { name: 'Products',      path: '/admin/products',     icon: Package },
  { name: 'Inventory',     path: '/admin/inventory',    icon: Layers },
  { name: 'Orders',        path: '/admin/orders',       icon: ShoppingCart },
  { name: 'Payments',      path: '/admin/payments',     icon: CreditCard },
  { name: 'Users',         path: '/admin/users',        icon: Users },
  { name: 'Notifications', path: '/admin/notifications',icon: Bell },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentPage = ADMIN_NAV.find(n =>
    n.path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(n.path)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    navigate('/welcome');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '72px',
        background: '#111827',
        borderRight: '1px solid #1f2937',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', inset: '0 auto 0 0',
        zIndex: 50, transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, color: '#fff'
          }}>E</div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', color: '#f1f5f9' }}>EuphoriaX</span>}
        </div>

        {/* Toggle Button */}
        <button onClick={() => setSidebarOpen(p => !p)} style={{
          margin: '12px 12px 4px', padding: '8px', borderRadius: 8, border: 'none',
          background: '#1f2937', color: '#9ca3af', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Section Label */}
        {sidebarOpen && <p style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', letterSpacing: 2, padding: '12px 20px 4px', textTransform: 'uppercase' }}>Main Menu</p>}

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ADMIN_NAV.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: sidebarOpen ? '10px 12px' : '10px',
                borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s',
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: isActive ? '#818cf8' : '#9ca3af',
                fontWeight: isActive ? 600 : 500, fontSize: 14,
                justifyContent: sidebarOpen ? 'flex-start' : 'center'
              }}>
                <Icon size={18} style={{ flexShrink: 0, color: isActive ? '#818cf8' : '#6b7280' }} />
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>}
                {sidebarOpen && isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#818cf8' }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: sidebarOpen ? '10px 12px' : '10px',
            borderRadius: 10, textDecoration: 'none', color: '#9ca3af',
            fontSize: 14, fontWeight: 500, justifyContent: sidebarOpen ? 'flex-start' : 'center'
          }}>
            <Store size={18} style={{ flexShrink: 0, color: '#6b7280' }} />
            {sidebarOpen && <span>View Store</span>}
          </Link>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: sidebarOpen ? '10px 12px' : '10px',
            borderRadius: 10, border: 'none', background: 'transparent',
            color: '#f87171', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            justifyContent: sidebarOpen ? 'flex-start' : 'center', width: '100%'
          }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Admin Avatar */}
        {sidebarOpen && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13, color: '#fff'
            }}>K</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: '#f1f5f9', margin: 0 }}>KANISHGA S</p>
              <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>Administrator</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? '240px' : '72px', transition: 'margin-left 0.3s ease', display: 'flex', flexDirection: 'column' }}>

        {/* Top Header */}
        <header style={{
          height: 60, background: '#111827', borderBottom: '1px solid #1f2937',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 40
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b7280' }}>
            <span>Admin</span>
            <ChevronRight size={14} />
            <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{currentPage?.name || 'Dashboard'}</span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 380, margin: '0 24px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input placeholder="Search anything..." style={{
              width: '100%', background: '#1f2937', border: '1px solid #374151',
              borderRadius: 10, padding: '8px 12px 8px 36px', color: '#e2e8f0',
              fontSize: 13, outline: 'none', boxSizing: 'border-box'
            }} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid #374151',
              color: '#e2e8f0', textDecoration: 'none', fontSize: 13, fontWeight: 500,
              background: 'transparent'
            }}>View Store</Link>
            <button style={{
              position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af'
            }}>
              <Bell size={18} />
              <span style={{
                position: 'absolute', top: -2, right: -2, width: 8, height: 8,
                background: '#ef4444', borderRadius: '50%'
              }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
