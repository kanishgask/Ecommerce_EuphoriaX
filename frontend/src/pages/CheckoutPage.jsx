import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Wallet, Truck, MapPin, Smartphone, Loader2, XCircle, AlertCircle, RefreshCcw, ShieldCheck } from 'lucide-react';
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice';
import { initiatePayment, verifyPayment, resetPaymentState } from '../store/slices/paymentSlice';
import PageTransition from '../components/shared/PageTransition';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import confetti from 'canvas-confetti';

const STEPS = ['Shipping', 'Review', 'Payment', 'Confirmation'];

const UPI_PROVIDERS = [
  { id: 'gpay', name: 'Google Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500' },
  { id: 'phonepe', name: 'PhonePe', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500' },
  { id: 'paytm', name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400' },
  { id: 'amazon', name: 'Amazon Pay', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400' },
  { id: 'bhim', name: 'BHIM UPI', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500' },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'credit', 'debit', 'cod'
  const [upiProvider, setUpiProvider] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [upiMode, setUpiMode] = useState('app'); // 'app' or 'id'
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('Connecting...');
  
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [finalTotal, setFinalTotal] = useState(0);

  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { register: registerShipping, handleSubmit: submitShipping } = useForm();
  const { register: registerPayment, handleSubmit: submitPayment } = useForm();

  // Calculate final total (adding mock shipping & tax)
  useEffect(() => {
    setFinalTotal((subtotal + 15 + (subtotal * 0.08)).toFixed(2));
  }, [subtotal]);

  // Handle Return from Demo Bank
  useEffect(() => {
    const status = searchParams.get('payment_status');
    const returnedPaymentId = searchParams.get('payment_id');
    
    if (status) {
      if (status === 'success') {
        handlePaymentSuccess(returnedPaymentId);
      } else {
        handlePaymentFailure();
      }
      // Clean up URL
      setSearchParams({});
    }
  }, [searchParams]);

  const handleNextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handlePrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const simulateLoadingSequence = async () => {
    const texts = ['Connecting to Gateway...', 'Authorizing...', 'Waiting for Bank...', 'Processing Transaction...'];
    for (let i = 0; i < texts.length; i++) {
      setLoadingText(texts[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const handlePlaceOrder = async (data) => {
    if (paymentMethod === 'upi' && upiMode === 'id') {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiId)) {
        toast.error("Please enter a valid UPI ID (e.g. name@bank)");
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate Loading Sequence
    await simulateLoadingSequence();

    try {
      // Create order via our mock backend service
      const response = await dispatch(initiatePayment({
        amount: finalTotal,
        method: paymentMethod,
        details: paymentMethod === 'upi' ? (upiMode === 'app' ? upiProvider : upiId) : 'card_details'
      })).unwrap();
      
      if (paymentMethod === 'cod') {
        // Direct success for COD
        handlePaymentSuccess('COD_' + Date.now());
      } else {
        // Redirect to Demo Bank
        navigate(`/mock-bank?order_id=${response.id}&amount=${finalTotal}&method=${paymentMethod}`);
      }
    } catch (err) {
      toast.error('Failed to initialize payment gateway.');
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (returnedPaymentId) => {
    setIsProcessing(false);
    setPaymentId(returnedPaymentId);
    setOrderId(`EU-${(Math.random() * 1000000).toFixed(0)}`);
    setCurrentStep(3); // Go to Confirmation
    
    // Fire Confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2dd4bf', '#06b6d4']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2dd4bf', '#06b6d4']
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Process Order (Empty cart, etc.)
    dispatch(clearCart());
  };

  const handlePaymentFailure = () => {
    setIsProcessing(false);
    toast.error('Payment failed or was cancelled.', { icon: <XCircle className="text-red-500" /> });
    setCurrentStep(2); // Ensure we are on payment step
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("EuphoriaX - Order Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, 20, 35);
    doc.text(`Transaction ID: ${paymentId}`, 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Payment Method: ${paymentMethod.toUpperCase()}`, 20, 58);
    doc.text("Order Summary:", 20, 75);
    let yPos = 85;
    doc.text("--------------------------------------------------", 20, yPos);
    yPos += 10;
    doc.setFontSize(14);
    doc.text(`Total Amount Paid: $${finalTotal}`, 20, yPos);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for shopping with EuphoriaX!", 20, yPos + 20);
    doc.save(`Invoice_${orderId}.pdf`);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-white/10 z-0 rounded-full" />
      <motion.div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full z-0 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
      />
      {STEPS.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={step} className="relative z-10 flex flex-col items-center gap-3">
            <motion.div 
              initial={false}
              animate={{ 
                scale: isActive ? 1.2 : 1,
                backgroundColor: isActive ? '#2dd4bf' : isCompleted ? '#083344' : '#162028',
                borderColor: isActive || isCompleted ? '#2dd4bf' : '#334155'
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-500 ${
                isActive ? 'text-[#0b1114] shadow-[0_0_20px_rgba(45,212,191,0.6)]' : 
                isCompleted ? 'text-teal-400' : 'text-white/30'
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : (idx + 1)}
            </motion.div>
            <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-500 ${isActive ? 'text-teal-400' : isCompleted ? 'text-white' : 'text-white/30'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-black text-white mb-12 text-center tracking-tight">Checkout</h1>
        
        {renderStepIndicator()}

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* STEP 0: SHIPPING */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl mx-auto"
              >
                <Card className="bg-[#121b22] border-white/5 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Shipping Address</h2>
                  </div>
                  <form onSubmit={submitShipping(handleNextStep)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Input label="First Name" required {...registerShipping('firstName')} />
                      <Input label="Last Name" required {...registerShipping('lastName')} />
                    </div>
                    <Input label="Street Address" required {...registerShipping('address')} />
                    <div className="grid grid-cols-3 gap-6">
                      <Input label="City" required {...registerShipping('city')} />
                      <Input label="State" required {...registerShipping('state')} />
                      <Input label="ZIP" required {...registerShipping('zip')} />
                    </div>
                    <Input label="Phone Number" type="tel" required {...registerShipping('phone')} />
                    <div className="flex justify-end pt-6">
                      <Button variant="gradient" type="submit" size="lg">Continue to Review</Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* STEP 1: REVIEW */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl mx-auto"
              >
                <Card className="bg-[#121b22] border-white/5 p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-6">Review Your Order</h2>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-[#162028] p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={item.image || (item.images && item.images[0])} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-white line-clamp-1">{item.name}</p>
                            <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-cyan-400">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-6 flex justify-between items-center text-xl font-bold">
                    <span className="text-white">Total to Pay:</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">${finalTotal}</span>
                  </div>
                  <div className="flex justify-between pt-8">
                    <Button variant="outline" size="lg" onClick={handlePrevStep}>Back</Button>
                    <Button variant="gradient" size="lg" onClick={handleNextStep}>Proceed to Payment</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: PAYMENT (REDESIGNED) */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-3xl mx-auto"
              >
                <Card className="bg-[#121b22] border-white/5 p-8 shadow-2xl overflow-hidden relative">
                  
                  {isProcessing && (
                    <div className="absolute inset-0 bg-[#0b1114]/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center rounded-3xl">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full mb-6 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                      />
                      <motion.h3 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold text-white mb-2"
                      >
                        {loadingText}
                      </motion.h3>
                      <p className="text-cyan-400/60 font-mono text-sm tracking-widest">DO NOT CLOSE THIS WINDOW</p>
                    </div>
                  )}

                  <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-8">
                    <div>
                      <h2 className="text-3xl font-black text-white mb-1">Payment Gateway</h2>
                      <p className="text-white/50 text-sm flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure encrypted transaction
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Amount to Pay</p>
                      <p className="text-3xl font-black text-cyan-400">${finalTotal}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { id: 'upi', label: 'UPI App', icon: Smartphone, color: 'text-green-400' },
                      { id: 'credit', label: 'Credit Card', icon: CreditCard, color: 'text-purple-400' },
                      { id: 'debit', label: 'Debit Card', icon: Wallet, color: 'text-cyan-400' },
                      { id: 'cod', label: 'Cash', icon: Truck, color: 'text-orange-400' },
                    ].map(method => (
                      <div 
                        key={method.id} 
                        onClick={() => setPaymentMethod(method.id)}
                        className={`cursor-pointer p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-300 ${
                          paymentMethod === method.id 
                            ? `border-white/20 bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-105 ${method.color}` 
                            : 'border-white/5 bg-[#162028] text-white/40 hover:border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <method.icon className={`w-8 h-8 ${paymentMethod === method.id ? method.color : 'text-white/40'}`} />
                        <span className="font-bold text-sm uppercase tracking-wider">{method.label}</span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={submitPayment(handlePlaceOrder)}>
                    <AnimatePresence mode="wait">
                      
                      {/* UPI FLOW */}
                      {paymentMethod === 'upi' && (
                        <motion.div
                          key="upi-flow"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-6 mb-8 overflow-hidden"
                        >
                          <div className="flex gap-4 border-b border-white/5 pb-4">
                            <button 
                              type="button" 
                              onClick={() => setUpiMode('app')}
                              className={`flex-1 pb-2 text-sm font-bold uppercase tracking-wider ${upiMode === 'app' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40'}`}
                            >
                              Choose Provider
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setUpiMode('id')}
                              className={`flex-1 pb-2 text-sm font-bold uppercase tracking-wider ${upiMode === 'id' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/40'}`}
                            >
                              Enter UPI ID
                            </button>
                          </div>

                          {upiMode === 'app' ? (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {UPI_PROVIDERS.map(provider => (
                                <div 
                                  key={provider.id}
                                  onClick={() => setUpiProvider(provider.id)}
                                  className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                                    upiProvider === provider.id
                                      ? `${provider.border} ${provider.bg} ${provider.color} scale-105 shadow-lg`
                                      : 'border-white/5 bg-[#162028] text-white/50 hover:bg-white/5'
                                  }`}
                                >
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center p-2 bg-white`}>
                                    <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" />
                                  </div>
                                  <span className="text-xs font-bold whitespace-nowrap mt-1">{provider.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="max-w-md mx-auto">
                              <Input 
                                label="Enter UPI ID (VPA)" 
                                placeholder="name@bankname" 
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                required={upiMode === 'id'}
                              />
                              <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> A payment request will be sent to this ID.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* CARD FLOW */}
                      {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                        <motion.div
                          key="card-flow"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-8 overflow-hidden"
                        >
                          <div className="bg-[#162028] p-6 rounded-2xl border border-white/5 shadow-inner relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                              <CreditCard className="w-48 h-48" />
                            </div>
                            <div className="relative z-10 space-y-6">
                              <Input label="Card Number" placeholder="0000 0000 0000 0000" maxLength={19} required {...registerPayment('cardNumber')} />
                              <div className="grid grid-cols-2 gap-6">
                                <Input label="Expiry Date" placeholder="MM/YY" maxLength={5} required {...registerPayment('expiry')} />
                                <Input label="CVV" placeholder="123" maxLength={4} type="password" required {...registerPayment('cvv')} />
                              </div>
                              <Input label="Cardholder Name" placeholder="JOHN DOE" required {...registerPayment('nameOnCard')} />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* COD FLOW */}
                      {paymentMethod === 'cod' && (
                        <motion.div
                          key="cod-flow"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-6 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl mb-8 flex items-center justify-center font-medium gap-3"
                        >
                          <Truck className="w-6 h-6" />
                          You will pay ${finalTotal} in cash when your order is delivered.
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center border-t border-white/5 pt-8 mt-4">
                      <Button variant="outline" size="lg" type="button" onClick={handlePrevStep} disabled={isProcessing}>Back</Button>
                      <Button variant="gradient" size="lg" type="submit" isLoading={isProcessing} className="px-12 text-lg h-14 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        {paymentMethod === 'cod' ? 'Confirm Order' : `Pay $${finalTotal}`}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: CONFIRMATION (REDESIGNED) */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="w-full max-w-2xl mx-auto text-center"
              >
                <Card className="bg-[#121b22] border-white/5 py-16 px-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-[#121b22] to-[#121b22] pointer-events-none" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.3 }}
                      className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(6,182,212,0.4)] border border-cyan-500/50"
                    >
                      <Check className="w-12 h-12 text-cyan-400" />
                    </motion.div>
                    
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                      className="text-4xl font-black text-white mb-2 tracking-tight"
                    >
                      Payment Successful!
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                      className="text-white/60 mb-8 max-w-md mx-auto text-lg"
                    >
                      Your order has been placed successfully. A detailed invoice has been sent to your email.
                    </motion.p>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                      className="bg-[#162028] border border-white/5 p-6 rounded-2xl max-w-md mx-auto mb-10 text-left space-y-3"
                    >
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-white/50">Order ID</span>
                        <span className="text-white font-mono font-bold">{orderId}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-3">
                        <span className="text-white/50">Transaction ID</span>
                        <span className="text-white font-mono font-bold">{paymentId}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-white/50">Amount Paid</span>
                        <span className="text-cyan-400 font-bold">${finalTotal}</span>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
                      className="flex flex-col sm:flex-row justify-center gap-4"
                    >
                      <Button variant="outline" size="lg" onClick={handleDownloadInvoice}>
                        Download Invoice
                      </Button>
                      <Button variant="gradient" size="lg" onClick={() => navigate('/orders')}>
                        Track Order
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
