// src/redux/quizSlice.test.js
import quizReducer, {
    setQuestions,
    answerQuestion,
    setQuizConfig,
    resetQuiz,
    setTimeTaken,
    incrementDailyAttempts,
    resetDailyAttempts
  } from './quizSlice';
  
  describe('quizSlice', () => {
    const initialState = {
      questions: [],
      currentQuestion: 0,
      score: 0,
      quizConfig: {
        category: 'backend-engineer',
        subcategories: [],
        timePerQuestion: 1,
        isMockInterviewMode: false,
        dailyAttempts: 0,
      },
      isQuizFinished: false,
      timeTaken: 0,
    };
  
    it('should handle initial state', () => {
      expect(quizReducer(undefined, {})).toEqual(initialState);
    });
  
    it('should set questions', () => {
      const questions = [{ id: 1, question: 'What is Java?' }];
      const nextState = quizReducer(initialState, setQuestions(questions));
      expect(nextState.questions).toEqual(questions);
      expect(nextState.currentQuestion).toBe(0);
      expect(nextState.score).toBe(0);
      expect(nextState.isQuizFinished).toBe(false);
      expect(nextState.timeTaken).toBe(0);
    });
  
    it('should answer a question correctly', () => {
      const questions = [{ id: 1, question: 'What is Java?', correctAnswer: 'A' }];
      const stateWithQuestions = { ...initialState, questions };
      const nextState = quizReducer(stateWithQuestions, answerQuestion('A'));
      expect(nextState.score).toBe(1);
      expect(nextState.currentQuestion).toBe(0);
    });
  
    it('should answer a question incorrectly', () => {
      const questions = [{ id: 1, question: 'What is Java?', correctAnswer: 'A' }];
      const stateWithQuestions = { ...initialState, questions };
      const nextState = quizReducer(stateWithQuestions, answerQuestion('B'));
      expect(nextState.score).toBe(0);
      expect(nextState.currentQuestion).toBe(0);
    });
  
    it('should set quiz config', () => {
      const config = { category: 'frontend-engineer', subcategories: ['react'] };
      const nextState = quizReducer(initialState, setQuizConfig(config));
      expect(nextState.quizConfig.category).toBe('frontend-engineer');
      expect(nextState.quizConfig.subcategories).toEqual(['react']);
    });
  
    it('should reset the quiz', () => {
      const stateWithData = {
        ...initialState,
        questions: [{ id: 1, question: 'What is Java?', correctAnswer: 'A' }],
        currentQuestion: 1,
        score: 1,
        isQuizFinished: true,
        timeTaken: 120,
      };
      const nextState = quizReducer(stateWithData, resetQuiz());
      expect(nextState).toEqual(initialState);
    });
  
    it('should set time taken', () => {
      const nextState = quizReducer(initialState, setTimeTaken(120));
      expect(nextState.timeTaken).toBe(120);
    });
  
    it('should increment daily attempts', () => {
      const nextState = quizReducer(initialState, incrementDailyAttempts());
      expect(nextState.quizConfig.dailyAttempts).toBe(1);
    });
  
    it('should reset daily attempts', () => {
      const stateWithAttempts = {
        ...initialState,
        quizConfig: { ...initialState.quizConfig, dailyAttempts: 2 },
      };
      const nextState = quizReducer(stateWithAttempts, resetDailyAttempts());
      expect(nextState.quizConfig.dailyAttempts).toBe(0);
    });
  });
  