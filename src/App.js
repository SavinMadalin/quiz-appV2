// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setUser } from './redux/userSlice';
import { onAuthStateChangedListener } from './firebase';
import MainPage from './MainPage';
import QuizConfigPage from './QuizConfigPage';
import HistoryPage from './HistoryPage';
import SettingsPage from './SettingsPage';
import QuizPage from './QuizPage';
import ResultPage from './ResultPage';
import useSerializeUser from './hooks/useSerializeUser';
import TopNavbar from './components/TopNavbar';
import { setQuestions } from './redux/quizSlice';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ConfirmationPage from './ConfirmationPage'; // Import ConfirmationPage

function App() {
  const dispatch = useDispatch();
  const { quizConfig } = useSelector((state) => state.quiz);
  const { serializeUser } = useSerializeUser();

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      const serializedUser = serializeUser(firebaseUser);
      dispatch(setUser(serializedUser));
    });

    return () => unsubscribe();
  }, [dispatch, serializeUser]);

  useEffect(() => {
    return () => dispatch(setQuestions([]));
  }, [dispatch]);

  return (
    <div className={`${quizConfig.theme === 'dark' ? 'dark' : ''} min-h-screen`}>
      <Router>
        <TopNavbar />
        <div className=''>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/quiz-config" element={<QuizConfigPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} /> {/* Add the confirmation route */}
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
