import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const FEATURED_ITEMS = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80",
      badge: "New Arrival",
      name: "Nike Air Max Pro",
      price: "$199.00",
      borderColor: "border-cyan-400",
      textColor: "text-cyan-400",
      shadowColor: "rgba(6,182,212,0.4)"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80",
      badge: "Top Rated",
      name: "Premium Wireless Audio",
      price: "$299.00",
      borderColor: "border-purple-400",
      textColor: "text-purple-400",
      shadowColor: "rgba(168,85,247,0.4)"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80",
      badge: "Trending",
      name: "Classic Minimalist Watch",
      price: "$120.00",
      borderColor: "border-pink-400",
      textColor: "text-pink-400",
      shadowColor: "rgba(236,72,153,0.4)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_ITEMS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e) => {
    // Normalize coordinates from -1 to 1 based on center of screen
    mouseX.set((e.clientX / windowSize.width) * 2 - 1);
    mouseY.set((e.clientY / windowSize.height) * 2 - 1);
  };

  // Smooth springs for mouse movement
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  // Transforms for parallax
  const bgX = useTransform(smoothX, [-1, 1], ['-2%', '2%']);
  const bgY = useTransform(smoothY, [-1, 1], ['-2%', '2%']);
  const contentRotateX = useTransform(smoothY, [-1, 1], [5, -5]);
  const contentRotateY = useTransform(smoothX, [-1, 1], [-5, 5]);

  return (
    <div 
      className="min-h-screen bg-[#0b1114] flex flex-col items-center justify-center relative overflow-hidden px-4"
      onMouseMove={handleMouseMove}
      style={{ perspective: 1000 }}
    >
      
      {/* Interactive AI Image Background */}
      <motion.div 
        className="absolute inset-[-5%] z-0"
        style={{ x: bgX, y: bgY }}
      >
        <div className="absolute inset-0 bg-[#0b1114]/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1114] via-transparent to-[#0b1114]/50 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80" 
          alt="AI Abstract" 
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-teal-500/20 rounded-full blur-[120px] animate-pulse z-10" style={{ animationDelay: '2s' }} />
      </motion.div>

      {/* Main Content inside 3D Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ rotateX: contentRotateX, rotateY: contentRotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row items-center justify-between gap-12 pt-20"
      >
        {/* Left: Text Content */}
        <div className="lg:w-1/2 text-left space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div style={{ translateZ: 50 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">Enterprise E-Commerce</span>
          </motion.div>

          <motion.h1 style={{ translateZ: 80 }} className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight">
            Welcome to <br />
            <span className="text-gradient drop-shadow-2xl">EuphoriaX</span>
          </motion.h1>
          
          <motion.p style={{ translateZ: 40 }} className="text-lg md:text-xl text-white/80 max-w-xl font-light leading-relaxed">
            The next generation of premium shopping. Experience seamless navigation, exclusive collections, and a visually stunning interface designed for the modern aesthetic.
          </motion.p>

          <motion.div style={{ translateZ: 60 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-8 w-full">
            <Link to="/login" className="w-full sm:w-auto min-w-[200px]">
              <Button variant="gradient" size="lg" className="w-full">
                Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/register" className="w-full sm:w-auto min-w-[200px]">
              <Button variant="outline" size="lg" className="w-full">
                Create Account
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Interactive 3D Image Carousel */}
        <div className="lg:w-1/2 flex justify-center hidden md:flex" style={{ transformStyle: "preserve-3d" }}>
          <motion.div 
            style={{ translateZ: 120 }} 
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-[450px] aspect-square"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotateY: 30 }}
                transition={{ duration: 0.8, type: "spring", damping: 20 }}
                className="absolute inset-0 w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img 
                  src={FEATURED_ITEMS[currentIndex].image} 
                  alt={FEATURED_ITEMS[currentIndex].name}
                  className="w-full h-full object-cover rounded-3xl border border-white/20 mix-blend-normal cursor-pointer transition-shadow duration-500"
                  style={{ boxShadow: `0 0 80px ${FEATURED_ITEMS[currentIndex].shadowColor}` }}
                />
                
                {/* Overlay badge */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{ translateZ: 180 }}
                  className={`absolute -top-6 -right-6 bg-[#121b22]/90 backdrop-blur-xl border ${FEATURED_ITEMS[currentIndex].borderColor} p-5 rounded-3xl`}
                  style={{ boxShadow: `0 0 30px ${FEATURED_ITEMS[currentIndex].shadowColor}` }}
                >
                  <p className={`${FEATURED_ITEMS[currentIndex].textColor} font-black tracking-wider uppercase text-xs mb-1`}>{FEATURED_ITEMS[currentIndex].badge}</p>
                  <p className="text-white font-bold text-lg">{FEATURED_ITEMS[currentIndex].name}</p>
                  <p className="text-white/60 text-sm">{FEATURED_ITEMS[currentIndex].price}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-3" style={{ translateZ: 50 }}>
              {FEATURED_ITEMS.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
