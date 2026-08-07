import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = React.forwardRef(({ className, glass = true, hover = false, children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "rounded-2xl transition-all duration-500 overflow-hidden",
        glass ? "glass-card" : "bg-[#121b22] border border-white/5",
        hover && "hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(6,182,212,0.15)] hover:border-cyan-500/30",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = "Card";
export default Card;
