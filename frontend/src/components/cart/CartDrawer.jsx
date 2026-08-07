import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, setDrawerOpen, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import Button from '../ui/Button';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOpen = useSelector((state) => state.cart.isDrawerOpen);
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  const handleClose = () => dispatch(setDrawerOpen(false));
  
  const handleCheckout = () => {
    handleClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col"
          >
            <div className="flex h-full flex-col bg-[#0b1114] shadow-2xl border-l border-white/5">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">Your Cart ({cartCount})</h2>
                <button
                  onClick={() => dispatch(setDrawerOpen(false))}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <ShoppingBag className="w-16 h-16 opacity-20" />
                    <p>Your cart is empty.</p>
                    <Button variant="outline" onClick={handleClose}>Continue Shopping</Button>
                  </div>
                ) : (
                  <ul className="flex flex-col">
                    {items.map((item) => (
                      <li key={item.id} className="flex py-6 border-b border-white/5 px-6 hover:bg-white/[0.02] transition-colors">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-white">
                              <h3 className="line-clamp-2 pr-4">{item.name}</h3>
                              <p className="ml-4 text-cyan-400 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm mt-4">
                            <div className="flex items-center bg-[#121b22] rounded-lg border border-white/10 p-0.5">
                              <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} className="w-8 h-8 flex items-center justify-center text-white hover:text-cyan-400">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                              <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))} className="w-8 h-8 flex items-center justify-center text-white hover:text-cyan-400">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button type="button" onClick={() => dispatch(removeFromCart(item.id))} className="font-medium text-white/40 hover:text-red-400 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-white/5 px-6 py-6 bg-[#121b22]">
                  <div className="flex justify-between text-base font-bold text-white mb-4">
                    <p>Subtotal</p>
                    <p className="text-cyan-400">${total.toFixed(2)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-white/50 mb-6">Shipping and taxes calculated at checkout.</p>
                  
                  <div className="space-y-3">
                    <Button className="w-full" onClick={() => {
                      dispatch(setDrawerOpen(false));
                      navigate('/checkout');
                    }}>
                      Checkout
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => {
                      dispatch(setDrawerOpen(false));
                      navigate('/cart');
                    }}>
                      View Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
