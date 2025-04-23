import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom"; // Import useNavigate
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { setUser } from "./redux/userSlice";
// Import necessary Firebase functions
import {
  onAuthStateChangedListener,
  auth, // Assuming 'auth' is exported from your firebase.js
} from "./firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import MainPage from "./MainPage";
import QuizConfigPage from "./QuizConfigPage";
import HistoryPage from "./HistoryPage";
import SettingsPage from "./SettingsPage";
import QuizPage from "./QuizPage";
import ResultPage from "./ResultPage";
import useSerializeUser from "./hooks/useSerializeUser";
import { setQuestions } from "./redux/quizSlice";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ConfirmationPage from "./ConfirmationPage";
import SubscriptionPage from "./SubscriptionPage";
import ResetPasswordPage from "./ResetPasswordPage";
import AuthActionHandlerPage from "./AuthActionHandlerPage";

function App() {
  const dispatch = useDispatch();
  // Note: useNavigate needs to be called within a component rendered by Router
  // We'll call it inside AppContent below
  const { quizConfig } = useSelector((state) => state.quiz);
  const { serializeUser } = useSerializeUser();
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // --- onAuthStateChanged Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await firebaseUser.reload();

          const serializedUser = serializeUser(firebaseUser);
          dispatch(setUser(serializedUser));

          setEmailVerified(firebaseUser.emailVerified);

          if (
            !firebaseUser.emailVerified &&
            emailSent &&
            !isRegistering &&
            !isDeletingUser
          ) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            if (pollingTimeoutRef.current) {
              clearTimeout(pollingTimeoutRef.current);
            }

            pollingIntervalRef.current = setInterval(async () => {
              await firebaseUser.reload();
              console.log("Polling emailVerified:", firebaseUser.emailVerified);
              if (firebaseUser.emailVerified) {
                setEmailVerified(true);
                clearInterval(pollingIntervalRef.current);
                clearTimeout(pollingTimeoutRef.current);
                setEmailSent(false);
              }
            }, 3000);

            pollingTimeoutRef.current = setTimeout(() => {
              clearInterval(pollingIntervalRef.current);
              setEmailSent(false);
            }, 65000);
          }
        } catch (error) {
          console.error("Error reloading user:", error);
        }
      } else {
        dispatch(setUser(null));
        setEmailVerified(false);
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
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [dispatch, serializeUser, emailSent, isRegistering, isDeletingUser]);

  // --- Other useEffect hooks ---
  useEffect(() => {
    return () => dispatch(setQuestions([]));
  }, [dispatch]);

  return (
    <div
      className={`${quizConfig.theme === "dark" ? "dark" : ""} min-h-screen`}
    >
      {/* Router needs to be inside App for useNavigate to work in child components */}
      <Router>
        <AppContent
          quizConfig={quizConfig}
          emailVerified={emailVerified}
          setEmailSent={setEmailSent}
          setIsDeletingUser={setIsDeletingUser}
          setIsRegistering={setIsRegistering}
          serializeUser={serializeUser} // Pass serializeUser down
        />
      </Router>
    </div>
  );
}

// Separate component to use hooks like useNavigate inside the Router context
function AppContent({
  quizConfig,
  emailVerified,
  setEmailSent,
  setIsDeletingUser,
  setIsRegistering,
  serializeUser, // Receive serializeUser
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Now useNavigate can be called here

  // --- Updated function to handle token from Flutter ---
  useEffect(() => {
    window.handleFlutterSignInToken = async (idToken) => {
      // Make the function async
      console.log("Received idToken from Flutter:", idToken);

      if (!idToken) {
        console.error("Received null or empty idToken from Flutter.");
        if (window.Toaster) {
          window.Toaster.postMessage("Google Sign-In failed (empty token).");
        }
        return;
      }

      try {
        // 1. Create a Google Auth credential using the idToken
        const credential = GoogleAuthProvider.credential(idToken);

        // 2. Sign in with the credential using Firebase client SDK
        // 'auth' needs to be your initialized Firebase Auth instance
        const userCredential = await signInWithCredential(auth, credential);

        console.log(
          "Firebase Sign-In with credential successful:",
          userCredential.user
        );

        // No need to manually dispatch setUser here.
        // The onAuthStateChanged listener will automatically detect the
        // signed-in user and update the Redux state.

        // Optional: Navigate the user after successful sign-in
        // navigate('/'); // Navigate to home or dashboard
      } catch (error) {
        console.error(
          "Error signing in with credential from Flutter token:",
          error
        );
        if (window.Toaster) {
          window.Toaster.postMessage(`Google Sign-In failed: ${error.message}`);
        }
        // Handle specific errors if needed (e.g., invalid token)
      }
    };

    // Cleanup function
    return () => {
      delete window.handleFlutterSignInToken;
    };
    // Add 'auth' to dependencies if it's not stable, though usually it is.
  }, [dispatch, navigate, serializeUser]); // Added dependencies

  return (
    <div className="">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route
          path="/settings"
          element={
            <SettingsPage
              emailVerified={emailVerified}
              setEmailSent={setEmailSent}
              setIsDeletingUser={setIsDeletingUser}
            />
          }
        />
        <Route path="/quiz-config" element={<QuizConfigPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={
            <RegisterPage
              setEmailSent={setEmailSent}
              setIsRegistering={setIsRegistering}
            />
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/auth/action" element={<AuthActionHandlerPage />} />
      </Routes>
    </div>
  );
}

export default App;
