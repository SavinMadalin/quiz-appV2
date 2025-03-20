// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import quizReducer from './quizSlice'; // Your quiz reducer for handling quiz-related state
import historyReducer from './historySlice'; // Import the new reducer

export const store = configureStore({
  reducer: {
    user: userReducer,
    quiz: quizReducer, // Your quiz state goes here
    history: historyReducer, // Add the new reducer
  },
});
