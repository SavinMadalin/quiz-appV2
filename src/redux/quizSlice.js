// src/redux/quizSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questions: [],
  currentQuestion: 0,
  score: 0,
  quizConfig: {
    category: 'backend-engineer',
    subcategories: [],
    timePerQuestion: 1,
    isMockInterviewMode: false,
  },
  isQuizFinished: false,
  timeTaken: 0, // Add timeTaken to the initial state
};

export const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
      state.currentQuestion = 0;
      state.score = 0;
      state.isQuizFinished = false;
      state.timeTaken = 0; // Reset timeTaken when new questions are set
    },
    answerQuestion: (state, action) => {
      const currentQuestionData = state.questions[state.currentQuestion];
      if (currentQuestionData && action.payload === currentQuestionData.correctAnswer) {
        state.score += 1;
      }
      // Increment currentQuestion only if it's not the last question
      if (state.currentQuestion < state.questions.length - 1) {
        state.currentQuestion += 1;
      } else {
        state.isQuizFinished = true;
      }
    },
    setQuizConfig: (state, action) => {
      state.quizConfig = action.payload;
    },
    resetQuiz: (state) => {
      state.questions = [];
      state.currentQuestion = 0;
      state.score = 0;
      state.isQuizFinished = false;
      state.timeTaken = 0;
    },
    setTimeTaken: (state, action) => { // Add a new reducer to set timeTaken
      state.timeTaken = action.payload;
    },
  },
});

export const { setQuestions, answerQuestion, setQuizConfig, resetQuiz, setTimeTaken } = quizSlice.actions;

export default quizSlice.reducer;
