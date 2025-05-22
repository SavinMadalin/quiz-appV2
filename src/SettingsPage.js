// src/SettingsPage.js
import { useDispatch, useSelector } from "react-redux";
import { resetUserHistory } from "./redux/historySlice";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { useState, useEffect } from "react";
import {
  UserCircleIcon,
  PaintBrushIcon,
  TrashIcon,
  CogIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  ArrowDownTrayIcon, // For download button
} from "@heroicons/react/24/outline";
import { auth, db, deleteUser, logout, updateDisplayName } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import ConfirmPopup from "./components/ConfirmPopup";
import { useNavigate } from "react-router-dom";
import { setUser } from "./redux/userSlice";
import { resendVerificationEmail } from "./firebase";
import { toggleTheme } from "./redux/themeSlice";
import { AndroidLogo } from "./components/Logos"; // Import AndroidLogo

const SettingsPage = ({ emailVerified, setEmailSent, setIsDeletingUser }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [isEmailSentMessageVisible, setIsEmailSentMessageVisible] =
    useState(false); // Renamed for clarity
  const [error, setError] = useState(null);
  const { isDarkMode } = useSelector((state) => state.theme);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [showReauthenticatePopup, setShowReauthenticatePopup] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [deleteError, setDeleteError] = useState(null); // New error state for deletion

  // Define API_BASE_URL (ensure consistency with other files for production/development)
  const API_BASE_URL = "http://localhost:4242";
  // const API_BASE_URL = "https://devprep-backend--myproject-6969b.europe-west4.hosted.app";

  // getAuthToken can be defined here or imported if it becomes a shared utility
  const getAuthToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    console.warn("No current user found to get ID token.");
    return null;
  };

  const handleResendEmail = async () => {
    setError(null);
    try {
      await resendVerificationEmail();
      setEmailSent(true); // Notify App.js
      setIsEmailSentMessageVisible(true); // Show local message

      setTimeout(() => {
        setIsEmailSentMessageVisible(false);
      }, 3000);
    } catch (err) {
      console.error("Error resending verification email:", err);
      setError("Wait at least 1 minute before resending the email.");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    const newIsDarkMode = !isDarkMode;
    const themeMessage = newIsDarkMode ? "dark" : "light";
    if (window.ThemeChannel && window.ThemeChannel.postMessage) {
      window.ThemeChannel.postMessage(themeMessage);
    } else {
      console.error("ThemeChannel is not available or postMessage is missing.");
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleResetHistory = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmReset = async () => {
    setShowConfirmPopup(false);
    try {
      if (!user || !user.uid) {
        console.error("User not logged in or user ID missing.");
        return;
      }
      const q = query(
        collection(db, "results"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      dispatch(resetUserHistory());
      console.log("User history reset successfully!");
    } catch (error) {
      console.error("Error resetting user history:", error);
    }
  };

  const handleCancelReset = () => {
    setShowConfirmPopup(false);
  };

  const handleDeleteAccount = () => {
    setDeleteError(null); // Clear previous delete error
    setShowDeleteConfirmPopup(true);
  };
  // Helper function for retrying the backend deletion call
  const attemptBackendDeletionWithRetries = async (
    token,
    maxRetries = 3,
    delay = 1000
  ) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const backendResponse = await fetch(
          `${API_BASE_URL}/delete-user-and-subscription`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId: user.uid,
              userEmail: user.email,
              userName: user.displayName,
            }),
          }
        );
        if (backendResponse.ok) {
          return backendResponse; // Success
        }
        // If not ok, but not a network error, don't retry for client/server errors like 4xx/5xx immediately
        // unless it's a specific case we want to retry (e.g. 503 Service Unavailable)
        // For now, we'll let it fall through to throw an error if not ok.
        const errorData = await backendResponse.json();
        throw new Error(
          errorData.error || `Server error: ${backendResponse.status}`
        );
      } catch (error) {
        if (attempt === maxRetries) throw error; // Last attempt, rethrow
        await new Promise((resolve) => setTimeout(resolve, delay * attempt)); // Simple fixed delay, or delay * attempt for exponential
      }
    }
  };
  const handleConfirmDelete = async () => {
    setShowDeleteConfirmPopup(false);
    setIsDeletingUser(true);
    setDeleteError(null); // Clear previous errors
    try {
      // 1. Get auth token
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication failed. Please log in again.");
      }

      // 2. Attempt to delete Firebase Auth user FIRST
      await deleteUser(); // This is the Firebase Auth user deletion from firebase.js

      // 3. If Firebase user deletion is successful, proceed to delete backend (Stripe/Firestore) data
      await attemptBackendDeletionWithRetries(token); // Call the retry helper

      // 4. All deletions successful, now logout locally
      await logout(); // Firebase logout
      dispatch(setUser(null)); // Clear Redux state
      navigate("/login"); // Navigate to login page
    } catch (error) {
      if (error.message === "Authentication failed. Please log in again.") {
        setDeleteError(error.message);
      } else if (error.code === "auth/requires-recent-login") {
        setShowReauthenticatePopup(true);
        setDeleteError("Please log in again to complete account deletion.");
      } else if (
        error.message.includes(
          "Your account was removed from Firebase, but we encountered an issue"
        )
      ) {
        // This is the critical error from step 3's backend call failure
        console.error("Critical error during account deletion:", error.message);
        setDeleteError(error.message);
        // Attempt to ensure local logout as Firebase user is gone
        try {
          await logout();
          dispatch(setUser(null));
        } catch (e) {
          /* ignore */
        }
        navigate("/login"); // Guide user to login, as their account is partially deleted
      } else {
        console.error("Error deleting user:", error);
        setDeleteError(
          error.message || "An error occurred while deleting your account."
        );
      }
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleConfirmReauthenticate = async () => {
    setShowReauthenticatePopup(false);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error during reauthentication logout:", error); // More specific error
    }
  };

  const handleCancelReauthenticate = () => {
    setShowReauthenticatePopup(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmPopup(false);
  };

  const handleEditName = () => {
    setIsEditingName(true);
    setNewDisplayName(user.displayName || ""); // Ensure newDisplayName is not null
  };

  const handleSaveName = async () => {
    try {
      await updateDisplayName(newDisplayName);
      dispatch(
        setUser({
          ...user,
          displayName: newDisplayName,
        })
      );
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating display name:", error);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center flex items-center justify-center gap-2 text-gray-800 dark:text-white">
          <CogIcon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500" />
          Account Settings
        </h2>

        {isAuthenticated && user && !emailVerified && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative group">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 cursor-pointer" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-700 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  Your email is not verified. Please verify your email to access
                  all features.
                </span>
              </div>
              <button
                onClick={handleResendEmail}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-1.5 px-4 rounded-md text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                Resend Verification Email
              </button>
            </div>
            {isEmailSentMessageVisible && (
              <p className="text-green-500 text-sm mt-2">
                Verification email sent successfully!
              </p>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}

        {isAuthenticated && user && (
          <section className="mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2">
              <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
              User Information
            </h3>
            <div className="mb-3 flex items-center gap-2 text-sm sm:text-base">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Name:
              </span>
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-grow">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 text-green-500 hover:text-green-600"
                  >
                    <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    className="text-red-500 hover:text-red-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 dark:text-gray-100">
                    {user.displayName || "Not set"}
                  </span>
                  <button
                    onClick={handleEditName}
                    className="text-indigo-500 hover:text-indigo-600"
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm sm:text-base">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                Email:
              </span>{" "}
              <span className="text-gray-800 dark:text-gray-100">
                {user.email}
              </span>
            </p>
          </section>
        )}

        <section className="mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2">
            <PaintBrushIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
            Appearance
          </h3>
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-full focus:outline-none transition-colors duration-300 ${
                  !isDarkMode
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <SunIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-full focus:outline-none transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-indigo-500 text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Application Section - New */}
        <section className="mb-10">
          <h3 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2">
            <ArrowDownTrayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
            Application
          </h3>
          <a
            href="https://firebasestorage.googleapis.com/v0/b/myproject-6969b.firebasestorage.app/o/app-release.apk?alt=media&token=867796c5-811b-4aec-ae20-cb8ae3a80c93"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <AndroidLogo className="h-5 w-5" /> Download for Android
          </a>
        </section>

        {isAuthenticated && user && (
          <section className="mb-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2 text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2">
              <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
              Account Data
            </h3>
            <button
              onClick={handleResetHistory}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 w-full shadow-sm hover:shadow-md transition-all text-sm sm:text-base"
            >
              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
              <span>Reset Quiz History</span>
            </button>
          </section>
        )}

        {isAuthenticated && user && (
          <section className="flex flex-col gap-3">
            {deleteError && (
              <p className="text-red-500 text-sm mb-2 text-center">
                {deleteError}
              </p>
            )}
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 w-full shadow-sm hover:shadow-md transition-all text-sm sm:text-base"
            >
              <ExclamationTriangleIcon className="h-5 w-5" /> Delete Account
            </button>
          </section>
        )}
      </div>

      {showConfirmPopup && (
        <ConfirmPopup
          message="Are you sure you want to reset your history?"
          onConfirm={handleConfirmReset}
          onCancel={handleCancelReset}
        />
      )}
      {showDeleteConfirmPopup && (
        <ConfirmPopup
          message="Are you sure you want to delete your account? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      {showReauthenticatePopup && (
        <ConfirmPopup
          message="You need to re-authenticate to delete your account. Do you want to go to login page?"
          onConfirm={handleConfirmReauthenticate}
          onCancel={handleCancelReauthenticate}
        />
      )}
    </div>
  );
};

export default SettingsPage;
