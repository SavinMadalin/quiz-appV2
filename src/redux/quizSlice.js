// src/redux/quizSlice.js
import { createSlice } from '@reduxjs/toolkit';

export const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    questions: [],
    currentQuestion: 0,
    score: 0,
    quizConfig: {
      timePerQuestion: 1, // in minutes
      theme: 'light', // default theme
      category: 'java', // default category
    },
    isQuizFinished: false,
  },
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    answerQuestion: (state, action) => {
      const question = state.questions[state.currentQuestion];
        if (question && question.correctAnswer === action.payload) {
          state.score += 1;
        }
        if(state.currentQuestion < 9 ){
          state.currentQuestion++;
        } else {
          state.isQuizFinished = true;
        }
    },
    setQuizConfig: (state, action) => {
      state.quizConfig = action.payload;
    },
    resetQuiz: (state) => {
      state.currentQuestion = 0;
      state.score = 0;
      state.isQuizFinished = false;
    },
  },
});

export const { setQuestions, answerQuestion, setQuizConfig, resetQuiz } = quizSlice.actions;
export default quizSlice.reducer;
