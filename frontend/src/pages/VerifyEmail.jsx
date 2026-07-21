import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(searchParams.get('email') ? 1 : 1); // start at step 1
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.resendVerification(email);
      toast.success('Verification code sent! Please check your email.');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.verifyEmail(email, code);
      toast.success('Email verified! You can now sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code. Please try again.');
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
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-500/20 border border-primary-500/30 mb-4">
              <Mail className="h-8 w-8 text-primary-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Verify Email</h2>
            <p className="text-gray-300 text-sm">
              {step === 1 ? 'Enter your email to receive a verification code' : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleResend} className="space-y-6">
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
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-all disabled:opacity-50">
                {isLoading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Send Code <ArrowRight className="ml-2 h-4 w-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200 block">Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-center tracking-[0.5em] text-xl font-bold"
                    placeholder="000000"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-all disabled:opacity-50">
                {isLoading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><CheckCircle className="mr-2 h-4 w-4" /> Verify Email</>}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-gray-400 hover:text-gray-300 mt-2">
                ← Change email or resend code
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Already verified? <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
