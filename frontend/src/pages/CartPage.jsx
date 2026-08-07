import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { selectCartItems, selectCartTotal, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  
  const shipping = items.length > 0 ? 15.00 : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Your Cart is Empty</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
            Looks like you haven't added anything to your cart yet. Discover our premium collection.
          </p>
          <Button size="lg" onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
          <Link to="/shop" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card glass={false} className="flex flex-col sm:flex-row gap-6 p-4 items-center sm:items-start relative">
                  <div className="w-32 h-32 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1 line-clamp-2 pr-8">{item.name}</h3>
                        <button 
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="absolute sm:static top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} className="w-8 h-8 flex items-center justify-center hover:text-blue-600">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="w-8 h-8 flex items-center justify-center hover:text-blue-600">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-xl">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <Card className="sticky top-24 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Discount Code</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter code" className="h-10" />
                  <Button variant="outline" className="h-10 px-4">Apply</Button>
                </div>
              </div>

              <Button size="lg" className="w-full mb-4" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-6">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Secure Checkout
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4" /> Fast Shipping
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
