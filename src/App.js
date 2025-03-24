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
import ConfirmationPage from './ConfirmationPage';
import { useState } from 'react';

function App() {
  const dispatch = useDispatch();
  const { quizConfig } = useSelector((state) => state.quiz);
  const { serializeUser } = useSerializeUser();
  const [emailVerified, setEmailVerified] = useState(false); // Local state to track email verification
  const [emailSent, setEmailSent] = useState(false); // Track if verification email was sent

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await firebaseUser.reload(); // Reload user data from Firebase
          console.log('Reloaded user:', firebaseUser); // Log the user object
          console.log('Email Verified:', firebaseUser.emailVerified); // Log the emailVerified status

          const serializedUser = serializeUser(firebaseUser);
          dispatch(setUser(serializedUser)); // Update the user state in Redux

          // Update emailVerified state
          setEmailVerified(firebaseUser.emailVerified);

          // Start polling only if the email is not verified and the email was sent
          if (!firebaseUser.emailVerified && emailSent) {
            const interval = setInterval(async () => {
              await firebaseUser.reload();
              console.log('Polling emailVerified:', firebaseUser.emailVerified);
              if (firebaseUser.emailVerified) {
                setEmailVerified(true);
                clearInterval(interval); // Stop polling once verified
                clearTimeout(pollingTimeout); // Stop timeout
                setEmailSent(false); // Notify App.js that the email was sent
              }
            }, 3000); // Check every 3 seconds

            const pollingTimeout = setTimeout(() => {
              clearInterval(interval); // Stop polling after 2 minutes
              console.warn('Polling stopped: Email verification not detected.');
              setEmailSent(false); // Notify App.js that the email was sent
            }, 65000); // Stop polling after 2 minutes
          }
        } catch (error) {
          console.error('Error reloading user:', error);
        }
      } else {
        // No user is logged in
        dispatch(setUser(null)); // Clear the user state in Redux
        setEmailVerified(false); // Reset emailVerified state
      }
    });

    return () => unsubscribe();
  }, [dispatch, serializeUser, emailSent]);

  useEffect(() => {
    return () => dispatch(setQuestions([]));
  }, [dispatch]);


  return (
    <div className={`${quizConfig.theme === 'dark' ? 'dark' : ''} min-h-screen`}>
      <Router>
        <div className=''>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage emailVerified={emailVerified} setEmailSent={setEmailSent} />} />
            <Route path="/quiz-config" element={<QuizConfigPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage setEmailSent={setEmailSent} />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;