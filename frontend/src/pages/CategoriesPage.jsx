import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Watch, Headphones, Shirt, Footprints } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'High-fidelity audio & premium gadgets',
    icon: Headphones,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80',
    color: 'from-cyan-500/20 to-blue-500/20'
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Elevate your everyday carry',
    icon: Watch,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Trendsetting apparel for the bold',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80',
    color: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    id: 'footwear',
    name: 'Footwear',
    description: 'Step into the future of comfort',
    icon: Footprints,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80',
    color: 'from-orange-500/20 to-red-500/20'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
};

export default function CategoriesPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-white tracking-tight mb-4"
          >
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Categories</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Discover our meticulously curated collections designed to elevate your lifestyle.
          </motion.p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {CATEGORIES.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link to="/shop">
                <div className="group relative h-[400px] rounded-[32px] overflow-hidden bg-[#121b22] border border-white/5 shadow-2xl">
                  
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-60"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${category.color} mix-blend-overlay`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1114] via-[#0b1114]/50 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">{category.name}</h2>
                      <p className="text-white/70 mb-6">{category.description}</p>
                      
                      <div className="flex items-center text-cyan-400 font-semibold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        Shop Collection <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </PageTransition>
  );
}
