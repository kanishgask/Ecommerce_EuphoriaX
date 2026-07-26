import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();

  const total = getCartTotal();
  const shipping = total > 100 ? 0 : 15;
  const finalTotal = total + (items.length > 0 ? shipping : 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/products');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-dark-900 border-l border-white/10 z-50 flex flex-col transform transition-transform duration-500 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-dark-950/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Your Cart</h2>
            <span className="bg-dark-800 text-gray-300 text-xs font-bold px-2.5 py-1 rounded-full">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-70">
              <div className="w-24 h-24 rounded-full bg-dark-800 flex items-center justify-center">
                <ShoppingBag size={40} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-white mb-2">Your cart is empty</p>
                <p className="text-gray-400 max-w-[250px] mx-auto">Looks like you haven't added any premium items yet.</p>
              </div>
              <button 
                onClick={handleContinueShopping}
                className="btn-primary py-3 px-8 rounded-full bg-dark-800 hover:bg-dark-700 text-white font-medium transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, idx) => {
                const prod = item.product || item;
                const id = prod.productId || prod._id || item.productId || item._id || idx;
                const name = prod.name || item.name || 'Premium Item';
                const image = prod.image || prod.images?.[0] || item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070';
                const price = prod.price || item.price || 0;
                return (
                <div key={id} className="flex gap-4 group">
                  {/* Item Image */}
                  <div className="w-24 h-24 rounded-2xl bg-dark-800 flex items-center justify-center p-2 flex-shrink-0 border border-white/5 relative overflow-hidden">
                    <img 
                      src={image} 
                      alt={name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 flex flex-col py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-white line-clamp-1">{name}</h3>
                      <button 
                        onClick={() => removeItem(id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-primary-400 font-bold mb-auto">${price.toFixed(2)}</p>
                    
                    {/* Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-dark-800 rounded-lg p-1 border border-white/5">
                        <button 
                          onClick={() => updateQuantity(id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(id, item.quantity + 1)}
                          className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-300">
                        ${(price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/5 bg-dark-950 p-6 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-primary-400 font-medium">Free</span>
                ) : (
                  <span className="text-white font-medium">${shipping.toFixed(2)}</span>
                )}
              </div>
            </div>
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg text-gray-300">Total</span>
              <span className="text-2xl font-black text-white">${finalTotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-amber-500 text-white font-bold rounded-2xl hover:from-primary-500 hover:to-amber-400 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 group"
            >
              Checkout Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
