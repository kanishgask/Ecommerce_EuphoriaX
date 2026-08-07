import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ShoppingBag, Eye, Heart, Headphones, Watch, Shirt, Footprints } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageTransition from '../components/shared/PageTransition';

// Mock Data
const HERO_SLIDES = [
  {
    id: 1,
    title: "Elevate Your Lifestyle.",
    subtitle: "Curated premium tech, runway fashion, and luxury home essentials designed for the modern aesthetic.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80",
    gradient: "from-cyan-500/20 to-transparent",
    category: "LIFESTYLE"
  },
  {
    id: 2,
    title: "Next-Gen Audio.",
    subtitle: "Experience studio-quality sound with our latest collection of premium wireless headphones.",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80",
    gradient: "from-purple-500/20 to-transparent",
    category: "ELECTRONICS"
  },
  {
    id: 3,
    title: "Minimalist Fashion.",
    subtitle: "Discover the new season's collection featuring clean lines and sustainable materials.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80",
    gradient: "from-teal-500/20 to-transparent",
    category: "FASHION"
  }
];


export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageTransition>
      {/* --- HERO SECTION --- */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 bg-[#0b1114]/80 z-10" />
            <div className={`absolute inset-0 bg-gradient-to-r ${HERO_SLIDES[currentSlide].gradient} z-10`} />
            <img 
              src={HERO_SLIDES[currentSlide].image} 
              alt="Hero" 
              className="w-full h-full object-cover object-center opacity-40"
            />
          </motion.div>
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full flex flex-col md:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                  <span className="text-xs font-bold tracking-widest text-white/70 uppercase">
                    {HERO_SLIDES[currentSlide].category}
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
                  {HERO_SLIDES[currentSlide].title.split(' ').map((word, i, arr) => (
                    i === arr.length - 1 ? <span key={i} className="text-gradient block">{word}</span> : word + ' '
                  ))}
                </h1>
                
                <p className="text-lg text-white/60 max-w-xl mx-auto md:mx-0 font-light leading-relaxed">
                  {HERO_SLIDES[currentSlide].subtitle}
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                  <Link to="/shop">
                    <Button variant="primary" size="lg">
                      Shop Collection <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button variant="outline" size="lg">
                      View Categories
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Featured Card Preview (Reference Image 2) */}
          <div className="hidden md:block flex-1 relative h-[500px]">
             <AnimatePresence mode="wait">
                <motion.div
                  key={`card-${currentSlide}`}
                  initial={{ opacity: 0, x: 50, rotateY: 15 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                >
                  <img src={HERO_SLIDES[(currentSlide + 1) % HERO_SLIDES.length].image} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1114] via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between glass p-4 rounded-2xl">
                    <div>
                      <p className="text-white font-bold text-lg">{HERO_SLIDES[(currentSlide + 1) % HERO_SLIDES.length].category}</p>
                      <p className="text-white/60 text-sm font-medium">Coming up next</p>
                    </div>
                    <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
             </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-cyan-400' : 'w-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* --- INTERACTIVE CATEGORIES --- */}
      <section className="py-24 bg-[#0b1114]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Collections</h2>
              <p className="text-white/60">Find exactly what you're looking for.</p>
            </div>
            <Link to="/categories" className="hidden sm:flex items-center text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="relative w-full overflow-hidden flex py-4 -mx-4 px-4">
            <motion.div 
              className="flex gap-6 min-w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 15, repeat: Infinity }}
            >
              {[
                { id: 'electronics', name: 'Electronics', icon: Headphones, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80', color: 'from-cyan-500/80 to-blue-600/80' },
                { id: 'accessories', name: 'Accessories', icon: Watch, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80', color: 'from-purple-500/80 to-pink-600/80' },
                { id: 'fashion', name: 'Fashion', icon: Shirt, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80', color: 'from-emerald-500/80 to-teal-600/80' },
                { id: 'footwear', name: 'Footwear', icon: Footprints, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80', color: 'from-orange-500/80 to-red-600/80' },
                { id: 'electronics_dup', name: 'Electronics', icon: Headphones, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80', color: 'from-cyan-500/80 to-blue-600/80' },
                { id: 'accessories_dup', name: 'Accessories', icon: Watch, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80', color: 'from-purple-500/80 to-pink-600/80' },
                { id: 'fashion_dup', name: 'Fashion', icon: Shirt, image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80', color: 'from-emerald-500/80 to-teal-600/80' },
                { id: 'footwear_dup', name: 'Footwear', icon: Footprints, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80', color: 'from-orange-500/80 to-red-600/80' }
              ].map((cat, i) => (
                <div key={`${cat.id}-${i}`} className="w-[300px] shrink-0">
                  <Link to={`/shop?category=${cat.name}`}>
                    <div className="group relative h-[350px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-[#0b1114]/60 transition-opacity duration-300 group-hover:opacity-0" />
                      <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 mb-4 text-white group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            <cat.icon className="w-5 h-5" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                          <div className="flex items-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* --- TESTIMONIALS (Mock) --- */}
      <section className="py-24 bg-[#121b22] border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Loved by Innovators</h2>
          <p className="text-white/60 max-w-2xl mx-auto mb-16">Join thousands of customers who have elevated their lifestyle with EuphoriaX.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <Card glass className="p-8 text-left h-full">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-cyan-400 fill-cyan-400" />)}
                  </div>
                  <p className="text-white/80 italic mb-6">
                    "The quality and attention to detail is unmatched. EuphoriaX completely changed how I shop online. The shipping was incredibly fast and the packaging felt so premium."
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 p-[2px]">
                      <div className="w-full h-full bg-[#0b1114] rounded-full flex items-center justify-center font-bold text-xs">US</div>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Alex Chen</p>
                      <p className="text-white/40 text-xs">Verified Buyer</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEWSLETTER --- */}
      <section className="py-24 bg-[#0b1114]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Join the Exclusive Club</h2>
              <p className="text-white/60 mb-8 max-w-lg mx-auto">Subscribe to our newsletter for early access to drops, exclusive discounts, and personalized recommendations.</p>
              
              <form 
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Successfully subscribed to the newsletter!');
                  e.target.reset();
                }}
              >
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 h-12 rounded-full border border-white/10 bg-white/5 px-6 text-white focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-colors"
                  required
                />
                <Button type="submit" variant="gradient" className="rounded-full px-8 whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}
