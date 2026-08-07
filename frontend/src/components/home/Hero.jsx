import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 pt-16 pb-32 space-y-24">
      {/* Decorative background gradients */}
      <div className="absolute top-0 -translate-y-12 translate-x-1/3 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 translate-y-1/3 -translate-x-1/3 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="block text-slate-900 dark:text-white">Discover the</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Extraordinary.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400">
            Elevate your lifestyle with our premium collection of fashion, electronics, and exclusive accessories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto text-lg rounded-full">
              Shop the Collection
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg rounded-full">
              View Lookbook
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
