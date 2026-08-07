import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Award, Zap, Globe, Target } from 'lucide-react';
import PageTransition from '../components/shared/PageTransition';

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <PageTransition>
      <div className="relative overflow-hidden bg-[#0b1114] min-h-screen">
        
        {/* Parallax Hero */}
        <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80" 
              alt="Tech Background" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1114] to-transparent" />
          </motion.div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-6xl sm:text-7xl font-black text-white tracking-tight mb-6">
                Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">E-Commerce</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed font-light">
                We believe that shopping should be more than just a transaction. It should be an immersive experience that blends cutting-edge technology with unparalleled design.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-[#0b1114]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-white">Our Mission</h2>
              <div className="w-20 h-1 bg-cyan-400 rounded-full" />
              <p className="text-white/70 text-lg leading-relaxed">
                Founded in 2024, EuphoriaX set out to challenge the status quo of online shopping. We were tired of generic, uninspiring interfaces. Our mission is to build the world's most premium, visually stunning, and high-performance digital storefront.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                By leveraging state-of-the-art web technologies and collaborating with world-class designers, we deliver an award-winning user experience that feels less like a store and more like a work of art.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative aspect-square md:aspect-auto md:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.15)]"
            >
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80" 
                alt="Team working" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent mix-blend-overlay" />
            </motion.div>
          </div>

          {/* Core Values Grid */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Core Values</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">The pillars that drive our innovation and culture.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Performance", desc: "Blazing fast 60fps animations and instant load times." },
              { icon: Award, title: "Premium Quality", desc: "We compromise on nothing to deliver excellence." },
              { icon: Target, title: "User Centric", desc: "Every pixel is designed with the user in mind." },
              { icon: Globe, title: "Global Reach", desc: "Shipping state-of-the-art products worldwide." }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#121b22] border border-white/5 p-8 rounded-3xl hover:border-cyan-400/50 transition-colors group"
              >
                <div className="w-14 h-14 bg-cyan-400/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:bg-cyan-400 group-hover:text-[#0b1114] transition-all duration-300">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-white/60 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
