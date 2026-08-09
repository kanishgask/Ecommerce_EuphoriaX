import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(
  ({ className, type = "text", error, label, icon: Icon, ...props }, ref) => {
    const inputId = props.id || props.name || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-white/80">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-all duration-300 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-white/10",
              Icon && "pl-10",
              error && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-red-400 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
