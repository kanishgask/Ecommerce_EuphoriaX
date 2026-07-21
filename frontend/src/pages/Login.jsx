import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import { authService } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      const { accessToken, idToken } = response.data.data;
      
      // idToken contains cognito:groups and user attributes
      // accessToken is used for API authorization
      const decoded = jwtDecode(idToken);
      const groups = decoded['cognito:groups'] || [];
      const role = groups.includes('ADMIN') ? 'ADMIN' : 'USER';
      
      const userData = {
        id: decoded.sub,
        email: decoded.email || email,
        name: decoded.name || email.split('@')[0],
        role: role
      };

      login(userData, accessToken);
      toast.success('Welcome back!');
      
      if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 403) {
        toast.error('Account not verified. Please contact support or check your email.');
      } else {
        toast.error(message || 'Incorrect email or password.');

      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 rounded-3xl shadow-2xl bg-white/10 dark:bg-dark-900/40 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300 text-sm">Sign in to your EuphoriaX account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-200 block">Password</label>
                <a href="#" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all focus:ring-offset-dark-900 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-gray-300">
              Don't have an account? <a href="/register" className="font-medium text-primary-400 hover:text-primary-300">Sign up</a>
            </p>
            <p className="text-sm text-gray-400">
              Need to verify your email? <a href="/verify-email" className="font-medium text-primary-400 hover:text-primary-300">Verify here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
