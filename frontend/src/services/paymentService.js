export const paymentService = {
  // Simulates creating an order in the backend
  // In a real app, this would be a POST to /payments/create-order
  createOrder: async (orderData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        resolve({
          id: orderId,
          amount: orderData.amount,
          currency: 'USD',
          status: 'created',
          method: orderData.method
        });
      }, 800); // Small network delay
    });
  },

  // Simulates verifying a payment in the backend
  // In a real app, this would be a POST to /payments/verify
  verifyPayment: async (paymentDetails) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In this mock, we just trust the client's status parameter for demo purposes.
        // In real life, the backend verifies a cryptographic signature from Razorpay/Stripe.
        if (paymentDetails.status === 'success') {
          resolve({
            success: true,
            transactionId: `TXN_${Date.now()}`,
            message: 'Payment verified successfully',
            paymentId: paymentDetails.paymentId
          });
        } else {
          reject(new Error('Payment verification failed. Signature mismatch or user cancelled.'));
        }
      }, 1000);
    });
  }
};
