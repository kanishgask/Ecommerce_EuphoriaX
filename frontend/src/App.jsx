import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import DemoBankPage from './pages/DemoBankPage';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

// Simple Auth Guard for Demo Purposes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }
  return children;
};

// Lazy load admin pages
const AdminProducts      = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminInventory     = React.lazy(() => import('./pages/admin/AdminInventory'));
const AdminOrders        = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminPayments      = React.lazy(() => import('./pages/admin/AdminPayments'));
const AdminUsers         = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminNotifications = React.lazy(() => import('./pages/admin/AdminNotifications'));

const Loader = () => <div style={{color:'#9ca3af',padding:40,textAlign:'center'}}>Loading...</div>;

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Auth & Landing Routes (No Navbar) */}
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route path="/mock-bank" element={<DemoBankPage />} />

        {/* Main Application Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<React.Suspense fallback={<Loader />}><AdminProducts /></React.Suspense>} />
          <Route path="inventory" element={<React.Suspense fallback={<Loader />}><AdminInventory /></React.Suspense>} />
          <Route path="orders" element={<React.Suspense fallback={<Loader />}><AdminOrders /></React.Suspense>} />
          <Route path="payments" element={<React.Suspense fallback={<Loader />}><AdminPayments /></React.Suspense>} />
          <Route path="users" element={<React.Suspense fallback={<Loader />}><AdminUsers /></React.Suspense>} />
          <Route path="notifications" element={<React.Suspense fallback={<Loader />}><AdminNotifications /></React.Suspense>} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
