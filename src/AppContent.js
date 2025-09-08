import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import useNavigate
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { setUser } from "./redux/userSlice";
// --- Add these Firebase imports ---
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  onAuthStateChangedListener,
  getSessionIdForUser,
  logout,
  db,
} from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
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
import PoliciesPage from "./PoliciesPage";
import { useNavigate } from "react-router-dom";

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
  const { user, isAuthenticated } = useSelector((state) => state.user); // Get user from Redux
  const navigate = useNavigate();
  const sessionIntervalRef = useRef(null);

  // --- Session ID Polling ---
  useEffect(() => {
    // Only start polling if authenticated and sessionId exists
    if (isAuthenticated && user?.uid && localStorage.getItem("sessionId")) {
      const checkSession = async () => {
        const serverSessionId = await getSessionIdForUser(user.uid);
        const localSessionId = localStorage.getItem("sessionId");

        if (
          serverSessionId && // Check if serverSessionId is not null/undefined
          localSessionId &&
          serverSessionId !== localSessionId
        ) {
          console.log("Session mismatch detected. Logging out.");
          await logout();
          // The onAuthStateChanged listener will handle dispatching setUser(null)
          navigate("/login");
        }
      };

      // Start polling after a 5-second delay
      const timeoutId = setTimeout(() => {
        checkSession(); // Initial check
        // Then, set up the recurring interval
        sessionIntervalRef.current = setInterval(checkSession, 10000); // Check every 15 seconds
      }, 5000);

      // Cleanup on logout or unmount
      return () => {
        clearTimeout(timeoutId); // Clear the initial timeout
        if (sessionIntervalRef.current) {
          clearInterval(sessionIntervalRef.current);
          sessionIntervalRef.current = null;
        }
      };
    }
  }, [isAuthenticated, user?.uid, dispatch, navigate]); // Rerun when auth status or UID changes

  // --- Add this new useEffect hook ---
  useEffect(() => {
    // This function will be called by the Flutter app after a successful native sign-in
    window.handleFlutterSignInToken = async (idToken) => {
      if (!idToken) {
        console.error("Received null or empty idToken from Flutter.");
        return;
      }
      try {
        console.log("Received idToken from Flutter, signing into Firebase...");
        const auth = getAuth();
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);

        // Create and set the session ID for the Google user
        const sessionId = uuidv4();
        await setDoc(doc(db, "sessions", userCredential.user.uid), {
          sessionId,
        });
        localStorage.setItem("sessionId", sessionId);

        // The onAuthStateChanged listener will handle the user state update.
        navigate("/"); // Navigate to main page after successful login.
      } catch (error) {
        console.error("Error signing in with credential from Flutter:", error);
      }
    };

    // Clean up the function when the component unmounts
    return () => {
      delete window.handleFlutterSignInToken;
    };
  }, []); // Empty dependency array ensures this runs only once

  // --- onAuthStateChanged Listener (runs only once on mount) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await firebaseUser.reload();

          const serializedUser = serializeUser(firebaseUser);
          dispatch(setUser(serializedUser));

          setEmailVerified(firebaseUser.emailVerified); // Set initial verification status
        } catch (error) {
          console.error("Error reloading user:", error);
          dispatch(setUser(null));
        }
      } else {
        dispatch(setUser(null));
        setEmailVerified(false);
      }
    });

    return () => {
      unsubscribe();
    };
    // This should only run once to set up the auth state listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // --- Email Verification Polling Logic ---
  useEffect(() => {
    // This effect specifically handles the polling logic when emailSent is true.
    if (user && !user.emailVerified && emailSent && !isRegistering) {
      // Clear any existing timers before starting new ones
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);

      pollingIntervalRef.current = setInterval(async () => {
        const currentUser = getAuth().currentUser;
        await currentUser?.reload();
        if (currentUser?.emailVerified) {
          setEmailVerified(true); // Update local state
          dispatch(setUser(serializeUser(currentUser))); // Update redux state
          clearInterval(pollingIntervalRef.current);
          clearTimeout(pollingTimeoutRef.current);
          setEmailSent(false); // Stop polling
        }
      }, 3000);

      pollingTimeoutRef.current = setTimeout(() => {
        clearInterval(pollingIntervalRef.current);
        setEmailSent(false);
      }, 65000); // Stop polling after 65 seconds
    }

    // Cleanup function for this specific effect
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, [user, emailSent, isRegistering, dispatch, serializeUser]); // Dependencies for the polling logic

  // --- Other useEffect hooks ---
  useEffect(() => {
    return () => dispatch(setQuestions([]));
  }, [dispatch]);

  return (
    <div
      className={`${quizConfig.theme === "dark" ? "dark" : ""} min-h-screen`}
    >
      {/* Router needs to be inside App for useNavigate to work in child components */}
      <div className="">
        <Routes>
          {" "}
          {/* Pass setEmailSent to MainPage */}
          <Route path="/" element={<MainPage setEmailSent={setEmailSent} />} />
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
          <Route path="/policies" element={<PoliciesPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default AppContent;
