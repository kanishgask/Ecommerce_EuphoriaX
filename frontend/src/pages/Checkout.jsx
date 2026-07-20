import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    address: '', city: '', zipCode: '', country: 'US',
    cardNumber: '', expiry: '', cvc: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && !isAuthenticated && !formData.email) {
      toast.error('Email is required for guest checkout');
      return;
    }
    setStep(step + 1);
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment and order service interaction
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      setStep(3);
    }, 2000);
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/products" className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors mb-8 font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3">
          {step === 1 && (
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
              <form onSubmit={handleNext} className="space-y-6">
                {!isAuthenticated && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input type="email" name="email" required onChange={handleChange} value={formData.email} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input type="text" name="firstName" required onChange={handleChange} value={formData.firstName} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input type="text" name="lastName" required onChange={handleChange} value={formData.lastName} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input type="text" name="address" required onChange={handleChange} value={formData.address} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input type="text" name="city" required onChange={handleChange} value={formData.city} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input type="text" name="zipCode" required onChange={handleChange} value={formData.zipCode} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-4 mt-4 text-lg">Continue to Payment</button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <ShieldCheck className="h-6 w-6 mr-2 text-green-500" /> Secure Payment
              </h2>
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Card Number</label>
                  <input type="text" name="cardNumber" required placeholder="0000 0000 0000 0000" onChange={handleChange} value={formData.cardNumber} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input type="text" name="expiry" required placeholder="MM/YY" onChange={handleChange} value={formData.expiry} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVC</label>
                    <input type="text" name="cvc" required placeholder="123" onChange={handleChange} value={formData.cvc} className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent" />
                  </div>
                </div>
                
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl border border-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-dark-800 transition">Back</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 btn-primary py-4 text-lg flex items-center justify-center">
                    {isProcessing ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : `Pay $${(getCartTotal() + 15).toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="glass-panel p-12 rounded-3xl text-center">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 text-green-500 mb-6">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h2 className="text-4xl font-extrabold mb-4">Order Confirmed!</h2>
              <p className="text-gray-500 text-lg mb-8">Your order #ORD-{Math.floor(Math.random() * 100000)} has been placed successfully. We'll send you a confirmation email shortly.</p>
              <Link to="/products" className="btn-primary py-3 px-8 rounded-full text-lg">Continue Shopping</Link>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {step !== 3 && (
          <div className="w-full lg:w-1/3">
            <div className="glass-panel p-6 rounded-3xl sticky top-8">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                      <div className="text-gray-500 text-xs">Qty: {item.quantity}</div>
                      <div className="font-bold text-primary-600 mt-1">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Shipping</span>
                  <span>$15.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span>
                  <span>${(getCartTotal() + 15).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
