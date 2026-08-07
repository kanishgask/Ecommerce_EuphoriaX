import { createSlice } from '@reduxjs/toolkit';

// Utility to decode JWT without a library
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem('token') || null,
};

// Try to hydrate user from token on load
if (initialState.token) {
  const decoded = parseJwt(initialState.token);
  if (decoded) {
    initialState.isAuthenticated = true;
    initialState.user = {
      id: decoded.sub,
      email: decoded.email,
      firstName: decoded.given_name,
      lastName: decoded.family_name,
      fullName: `${decoded.given_name} ${decoded.family_name}`,
    };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { idToken, accessToken } = action.payload;
      localStorage.setItem('token', idToken); // use idToken for API calls to Cognito/Backend
      localStorage.setItem('isAuthenticated', 'true');
      
      state.token = idToken;
      state.isAuthenticated = true;
      
      const decoded = parseJwt(idToken);
      if (decoded) {
        state.user = {
          id: decoded.sub,
          email: decoded.email,
          firstName: decoded.given_name,
          lastName: decoded.family_name,
          fullName: `${decoded.given_name} ${decoded.family_name}`,
        };
      }
    },
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;
