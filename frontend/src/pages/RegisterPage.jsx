import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { User, Mail, Lock, Eye, EyeOff, Check, X, Smartphone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const registerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  password: z.string(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    if (!validations.every(v => v.test(passwordValue))) {
      toast.error('Please meet all password requirements');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the live AWS API Gateway endpoint
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });
      
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify', { state: { email: data.email } }); 
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      toast.error(error.response?.data?.message || 'Registration failed. Check if user already exists.');
    } finally {
      setIsLoading(false);
    }
  };

  const validations = [
    { label: "Minimum 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
    { label: "One number", test: (v) => /[0-9]/.test(v) },
    { label: "One special character", test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v) }
  ];

  return (
    <div className="min-h-screen bg-[#0b1114] py-12 px-4 relative overflow-hidden flex items-center justify-center">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/welcome" className="inline-block font-extrabold text-3xl tracking-tight text-white mb-2">
            Euphoria<span className="text-cyan-400">X</span>
          </Link>
          <p className="text-white/50 text-sm">Create your premium account</p>
        </div>

        <Card glass className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="First Name" icon={User} placeholder="John" {...register('firstName')} error={errors.firstName?.message} />
              <Input label="Last Name" icon={User} placeholder="Doe" {...register('lastName')} error={errors.lastName?.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Username" icon={User} placeholder="johndoe" {...register('username')} error={errors.username?.message} />
              <Input label="Mobile Number" type="tel" icon={Smartphone} placeholder="+1 (555) 000-0000" {...register('phone')} error={errors.phone?.message} />
            </div>

            <Input label="Email Address" type="email" icon={Mail} placeholder="john@example.com" {...register('email')} error={errors.email?.message} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    label="Password" 
                    type={showPassword ? "text" : "password"} 
                    icon={Lock} 
                    placeholder="••••••••" 
                    {...register('password')} 
                    onChange={(e) => {
                      register('password').onChange(e);
                      setPasswordValue(e.target.value);
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-white/40 hover:text-cyan-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Input label="Confirm Password" type={showPassword ? "text" : "password"} icon={Lock} placeholder="••••••••" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
            </div>

            {/* Real-time Password Validation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-2">
              <p className="text-xs font-semibold text-white/80 mb-3">Password Requirements:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {validations.map((req, i) => {
                  const isValid = req.test(passwordValue);
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {isValid ? <Check className="w-4 h-4 text-cyan-400" /> : <X className="w-4 h-4 text-white/30" />}
                      <span className={isValid ? "text-cyan-400" : "text-white/50"}>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group pt-2">
              <div className="w-5 h-5 mt-0.5 rounded border border-white/20 flex items-center justify-center group-hover:border-cyan-400 transition-colors shrink-0 relative">
                <input 
                  type="checkbox" 
                  className="absolute opacity-0 w-full h-full cursor-pointer z-10 m-0" 
                  required 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: agreeTerms ? 1 : 0, scale: agreeTerms ? 1 : 0 }}
                  className="w-3 h-3 bg-cyan-400 rounded-sm z-0 pointer-events-none" 
                />
              </div>
              <span className="text-xs text-white/60 leading-relaxed">
                By creating an account, you agree to EuphoriaX's <span className="text-cyan-400 hover:underline">Conditions of Use</span> and <span className="text-cyan-400 hover:underline">Privacy Notice</span>.
              </span>
            </label>

            <Button type="submit" variant="gradient" className="w-full mt-4" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white hover:text-cyan-400 transition-colors">
              Sign in here
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
