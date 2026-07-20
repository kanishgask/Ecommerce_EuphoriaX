import React from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { isOpen, closeCart, items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white dark:bg-dark-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 translate-x-0 border-l border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 py-0.5 px-2.5 rounded-full text-xs font-bold ml-2">
              {items.length}
            </span>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 space-y-4">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p className="text-lg">Your cart is empty.</p>
              <button 
                onClick={closeCart}
                className="text-primary-600 font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-dark-800 rounded-xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop'} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
                      ${parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dark-800/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={handleCheckout}
              className="w-full btn-primary py-4 flex items-center justify-center space-x-2 text-lg"
            >
              <span>Checkout</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
