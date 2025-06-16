import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import useNavigate
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { setUser } from "./redux/userSlice";
// Import necessary Firebase functions
import { onAuthStateChangedListener } from "./firebase";
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
import SubscriptionSuccessPage from "./SubscriptionSuccessPage";
import SubscriptionSettingsPage from "./SubscriptionSettingsPage"; // Import the new page
import ContactPage from "./ContactPage";
function AppContent() {
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
        <div className="">
          <Routes>
            {" "}
            {/* Pass setEmailSent to MainPage */}
            <Route
              path="/"
              element={<MainPage setEmailSent={setEmailSent} />}
            />
            <Route path="/subscription" element={<SubscriptionPage />} />{" "}
            {/* Add subscription route */}
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
            />{" "}
            {/* Pass setIsDeletingUser */}
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
            <Route path="/reset-password" element={<ResetPasswordPage />} />{" "}
            <Route
              path="/subscription-settings"
              element={<SubscriptionSettingsPage />}
            />{" "}
            {/* Add this route */}
            {/* Add this route */}
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/auth/action" element={<AuthActionHandlerPage />} />
            <Route
              path="/subscription-success"
              element={<SubscriptionSuccessPage />}
            />
            <Route path="/contact" element={<ContactPage />} />{" "}
            {/* Add Contact Page Route */}
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default AppContent;
