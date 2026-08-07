import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import CartDrawer from '../components/cart/CartDrawer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-color transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 w-full">
        <Outlet />
      </main>
      <CartDrawer />
      <footer className="py-8 text-center text-sm text-text-muted border-t border-slate-200 dark:border-slate-800">
        <p>&copy; {new Date().getFullYear()} EuphoriaX. All rights reserved.</p>
      </footer>
    </div>
  );
}
