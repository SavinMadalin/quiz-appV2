import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react'; // Import useRef
import { setUser } from './redux/userSlice';
import { onAuthStateChangedListener } from './firebase';
import MainPage from './MainPage';
import QuizConfigPage from './QuizConfigPage';
import HistoryPage from './HistoryPage';
import SettingsPage from './SettingsPage';
import QuizPage from './QuizPage';
import ResultPage from './ResultPage';
import useSerializeUser from './hooks/useSerializeUser';
import { setQuestions } from './redux/quizSlice';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ConfirmationPage from './ConfirmationPage';

function App() {
  const dispatch = useDispatch();
  const { quizConfig } = useSelector((state) => state.quiz);
  const { serializeUser } = useSerializeUser();
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const pollingIntervalRef = useRef(null); // Create a ref to hold the interval ID
  const pollingTimeoutRef = useRef(null); // Create a ref to hold the timeout ID
  const [isDeletingUser, setIsDeletingUser] = useState(false); // New state variable

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await firebaseUser.reload();
          console.log('Reloaded user:', firebaseUser);
          console.log('Email Verified:', firebaseUser.emailVerified);

          const serializedUser = serializeUser(firebaseUser);
          dispatch(setUser(serializedUser));

          setEmailVerified(firebaseUser.emailVerified);

          // Start polling only if the email is not verified, the email was sent, and we are not registering
          if (!firebaseUser.emailVerified && emailSent && !isRegistering && !isDeletingUser) {
            // Clear any existing interval
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
            }
  
            pollingIntervalRef.current = setInterval(async () => {
              await firebaseUser.reload();
              console.log('Polling emailVerified:', firebaseUser.emailVerified);
              if (firebaseUser.emailVerified) {
                setEmailVerified(true);
                clearInterval(pollingIntervalRef.current);
                clearTimeout(pollingTimeoutRef.current);
                setEmailSent(false);
              }
            }, 3000);

            pollingTimeoutRef.current = setTimeout(() => {
              clearInterval(pollingIntervalRef.current);
              console.warn('Polling stopped: Email verification not detected.');
              setEmailSent(false);
            }, 65000);
          }
        } catch (error) {
          console.error('Error reloading user:', error);
        }
      } else {
        dispatch(setUser(null));
        setEmailVerified(false);
        // Clear any existing interval when the user logs out
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
        }
      }
    });

    return () => {
      unsubscribe();
      // Clear any existing interval when the component unmounts
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [dispatch, serializeUser, emailSent, isRegistering, isDeletingUser]); // Add isDeletingUser to the dependency array

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
            <Route path="/settings" element={<SettingsPage emailVerified={emailVerified} setEmailSent={setEmailSent} setIsDeletingUser={setIsDeletingUser} />} /> {/* Pass setIsDeletingUser */}
            <Route path="/quiz-config" element={<QuizConfigPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage setEmailSent={setEmailSent} setIsRegistering={setIsRegistering} />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
