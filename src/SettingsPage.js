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
import { db, deleteUser, logout, updateDisplayName } from "./firebase";
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
    setShowDeleteConfirmPopup(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirmPopup(false);
    setIsDeletingUser(true);
    try {
      await deleteUser();
      await logout();
      dispatch(setUser(null));
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        setShowReauthenticatePopup(true);
      } else {
        console.error("Error deleting user:", error);
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
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white pt-20 pb-28 lg:pl-28">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-sm w-full mt-4">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <CogIcon className="h-8 w-8" />
          Settings
        </h2>

        {isAuthenticated && user && !emailVerified && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative group">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 cursor-pointer" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-yellow-500 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Your email is not verified. Please verify your email to access
                  all features.
                </span>
              </div>
              <button
                onClick={handleResendEmail}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm flex items-center gap-2"
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
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserCircleIcon className="h-6 w-6" />
              User Information
            </h3>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-medium">Name:</span>
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="p-1 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-green-500 hover:text-green-600"
                  >
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCancelEditName}
                    className="text-red-500 hover:text-red-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <span>{user.displayName || "Not set"}</span>
                  <button
                    onClick={handleEditName}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
          </section>
        )}

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PaintBrushIcon className="h-6 w-6" />
            Appearance
          </h3>
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-full focus:outline-none transition-colors duration-300 ${
                  !isDarkMode
                    ? "bg-yellow-400 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <SunIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-full focus:outline-none transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <MoonIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Application Section - New */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ArrowDownTrayIcon className="h-6 w-6" />
            Application
          </h3>
          <a
            href="https://firebasestorage.googleapis.com/v0/b/myproject-6969b.firebasestorage.app/o/app-release.apk?alt=media&token=867796c5-811b-4aec-ae20-cb8ae3a80c93"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <AndroidLogo className="h-5 w-5" /> Download for Android
          </a>
        </section>

        {isAuthenticated && user && (
          <section className="mb-8">
            <button
              onClick={handleResetHistory}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md flex items-center justify-center gap-2 w-full"
            >
              <TrashIcon className="h-5 w-5" /> <span>Reset history</span>
            </button>
          </section>
        )}

        {isAuthenticated && user && (
          <section className="mb-8 flex flex-col gap-2">
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md flex items-center justify-center gap-2 w-full"
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
