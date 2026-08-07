import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ShoppingCart, Heart } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Premium Wireless Headphones', price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', category: 'Electronics' },
  { id: '2', name: 'Minimalist Minimal Watch', price: 199.50, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80', category: 'Accessories' },
  { id: '3', name: 'Ergonomic Office Chair', price: 450.00, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80', category: 'Furniture' },
  { id: '4', name: 'Smart Home Hub', price: 129.99, image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=500&q=80', category: 'Electronics' },
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Trending Now</h2>
            <p className="text-slate-600 dark:text-slate-400">Our most popular premium items</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex">View All Products →</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MOCK_PRODUCTS.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <Card glass={false} className="p-0 overflow-hidden h-full flex flex-col border-none shadow-md hover:shadow-xl dark:bg-slate-800">
                <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Quick actions that slide up on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg h-10 w-10">
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg h-10 w-10 text-pink-500">
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">{product.category}</span>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-xl">${product.price.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Button variant="outline" className="w-full">View All Products</Button>
        </div>
      </div>
    </section>
  );
}
