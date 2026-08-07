import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService } from '../../services/paymentService';

export const initiatePayment = createAsyncThunk(
  'payment/initiate',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await paymentService.createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (paymentDetails, { rejectWithValue }) => {
    try {
      const response = await paymentService.verifyPayment(paymentDetails);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentOrder: null,
  verificationResult: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.currentOrder = null;
      state.verificationResult = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.verificationResult = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { resetPaymentState } = paymentSlice.actions;

export const selectCurrentOrder = (state) => state.payment.currentOrder;
export const selectPaymentStatus = (state) => state.payment.status;
export const selectPaymentError = (state) => state.payment.error;
export const selectVerificationResult = (state) => state.payment.verificationResult;

export default paymentSlice.reducer;
