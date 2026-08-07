import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem('isAuthenticated', 'true');
      toast.success('Authentication successful!');
      navigate('/'); // Go to Home
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1114] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/welcome" className="inline-block font-extrabold text-3xl tracking-tight text-white mb-2">
            Euphoria<span className="text-cyan-400">X</span>
          </Link>
          <p className="text-white/50 text-sm">Sign in to your premium account</p>
        </div>

        <Card glass className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              {...register('email')}
              error={errors.email?.message}
            />
            
            <div className="space-y-2">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={Lock}
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-white/40 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-cyan-400 transition-colors relative">
                    <input 
                      type="checkbox" 
                      className="absolute opacity-0 w-full h-full cursor-pointer z-10 m-0"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: rememberMe ? 1 : 0, scale: rememberMe ? 1 : 0 }}
                      className="w-2 h-2 bg-cyan-400 rounded-sm z-0 pointer-events-none" 
                    />
                  </div>
                  <span className="text-xs text-white/60 group-hover:text-white transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full mt-8" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-white/50">
            New to EuphoriaX?{' '}
            <Link to="/register" className="font-semibold text-white hover:text-cyan-400 transition-colors">
              Create an account
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
