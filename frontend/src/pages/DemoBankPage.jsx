import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ServerCrash, Building2, CheckCircle2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function DemoBankPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('order_id') || 'ORD_UNKNOWN';
  const amount = searchParams.get('amount') || '0.00';
  const method = searchParams.get('method') || 'UPI';

  const handleOutcome = (status) => {
    // Redirect back to checkout with the result
    // The checkout page will intercept this and handle success/failure
    navigate(`/checkout?payment_status=${status}&payment_id=PAY_${Date.now()}`);
  };

  return (
    <div className="min-h-screen bg-[#0b1114] flex flex-col items-center justify-center p-4">
      {/* Background styling for the bank portal */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Building2 className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">EuphoriaX Test Bank</h1>
          <p className="text-white/50 text-sm">Simulated Payment Gateway Environment</p>
        </div>

        <Card className="bg-[#121b22] border-white/10 p-8 shadow-2xl mb-8">
          <div className="space-y-4 mb-8 border-b border-white/5 pb-8">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Merchant</span>
              <span className="text-white font-semibold">EuphoriaX Inc.</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Transaction ID</span>
              <span className="text-white font-mono text-sm">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Payment Method</span>
              <span className="text-white font-semibold uppercase">{method}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-white/80 font-medium">Amount Payable</span>
              <span className="text-2xl font-bold text-cyan-400">${amount}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleOutcome('success')}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1"
            >
              <CheckCircle2 className="w-6 h-6" />
              Simulate Success
            </button>
            
            <button
              onClick={() => handleOutcome('failed')}
              className="w-full h-14 bg-[#162028] border border-red-500/30 hover:border-red-500 hover:bg-red-500/10 rounded-xl flex items-center justify-center gap-2 font-bold text-red-500 text-lg transition-all"
            >
              <ServerCrash className="w-6 h-6" />
              Simulate Failure
            </button>
          </div>
        </Card>

        <div className="text-center flex items-center justify-center gap-2 text-white/40 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>This is a secure, mocked environment. No real funds are processed.</span>
        </div>
      </motion.div>
    </div>
  );
}
