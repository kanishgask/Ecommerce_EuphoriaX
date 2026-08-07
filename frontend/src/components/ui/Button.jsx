import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-[#0b1114] disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group";
    
    const variants = {
      primary: "bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]", // Reference image shows white button with black text
      gradient: "bg-gradient-primary text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]", // Teal/Cyan gradient
      secondary: "bg-[#192630] text-white hover:bg-[#20303d] border border-white/5",
      outline: "border-2 border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5",
      ghost: "bg-transparent text-white hover:bg-white/10",
    };
    
    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-12 px-8 text-sm",
      lg: "h-14 px-10 text-base",
      icon: "h-12 w-12",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading}
        {...props}
      >
        {/* Subtle glow effect on hover for primary/gradient buttons */}
        {(variant === 'primary' || variant === 'gradient') && (
          <span className="absolute inset-0 w-full h-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
        
        <span className="relative flex items-center gap-2">
          {isLoading && (
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
