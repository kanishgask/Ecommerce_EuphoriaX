import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { selectCartItems, selectCartTotal, updateQuantity, removeFromCart, syncUpdateQuantity, syncRemoveItem } from '../store/slices/cartSlice';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-[#0b1114] min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Shopping Cart</h1>
          <Link to="/shop" className="text-sm font-medium text-white/50 hover:text-cyan-400 flex items-center gap-2 transition-colors">
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
                <Card glass={false} className="flex flex-col sm:flex-row gap-6 p-4 items-center sm:items-start relative bg-[#121b22] border-white/5">
                  <div className="w-32 h-32 shrink-0 bg-white/5 rounded-xl overflow-hidden border border-white/10">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-xl text-white mb-1 line-clamp-2 pr-8">{item.name}</h3>
                        <button 
                          onClick={() => {
                            dispatch(removeFromCart(item.id));
                            dispatch(syncRemoveItem(item.id));
                          }}
                          className="absolute sm:static top-4 right-4 text-white/40 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-sm text-cyan-400 font-medium mb-4 uppercase tracking-wider">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 h-10">
                        <button 
                          onClick={() => {
                            const newQuantity = Math.max(1, item.quantity - 1);
                            dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
                            dispatch(syncUpdateQuantity({ productId: item.id, quantity: newQuantity }));
                          }} 
                          className="w-10 h-full flex items-center justify-center text-white/50 hover:text-cyan-400"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-white text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            const newQuantity = item.quantity + 1;
                            dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
                            dispatch(syncUpdateQuantity({ productId: item.id, quantity: newQuantity }));
                          }} 
                          className="w-10 h-full flex items-center justify-center text-white/50 hover:text-cyan-400"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-2xl text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <Card className="sticky top-24 p-6 bg-[#121b22] border-white/5">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Shipping</span>
                  <span className="font-medium text-white">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tax (8%)</span>
                  <span className="font-medium text-white">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-3xl font-extrabold text-cyan-400">${total.toFixed(2)}</span>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-white/70 block mb-2">Discount Code</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter code" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
                  <Button variant="outline" className="h-12 px-6 border-white/10 hover:bg-white/5 hover:text-cyan-400 text-white">Apply</Button>
                </div>
              </div>

              <Button variant="gradient" size="lg" className="w-full mb-4 h-14 text-lg" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>

              <div className="flex items-center justify-center gap-6 text-xs text-white/40 mt-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" /> Secure Checkout
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-400" /> Fast Shipping
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
