// src/redux/historySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: [], // Add the initial state if needed
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
      resetUserHistory: (state) => {
          // Reset the history to its initial state (empty array)
          state.history = [];
      },
  },
});

export const { resetUserHistory } = historySlice.actions;

export default historySlice.reducer;
