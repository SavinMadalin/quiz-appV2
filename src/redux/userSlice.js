// src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  isEmailVerified: false, // Add this line
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      if (action.payload) {
        // Serialize only the necessary user data
        state.user = {
          uid: action.payload.uid,
          email: action.payload.email,
          displayName: action.payload.displayName,
          provider: action.payload.provider, // Add the provider
          emailVerified: action.payload.emailVerified, // Add the emailVerified
          // Add other relevant properties here if needed (e.g., photoURL)
        };
        state.isEmailVerified = action.payload?.emailVerified || false; // Add this line
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.isAuthenticated = false;
      }
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;

export default userSlice.reducer;
