// src/SettingsPage.js
import { useDispatch, useSelector } from 'react-redux';
import { setQuizConfig } from './redux/quizSlice';
import { resetUserHistory } from './redux/historySlice';
import Navbar from './Navbar';
import TopNavbar from './components/TopNavbar';
import { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';
import { db, deleteUser, logout, updateDisplayName } from './firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import ConfirmPopup from './components/ConfirmPopup';
import { useNavigate } from 'react-router-dom';
import { setUser } from './redux/userSlice';
import { resendVerificationEmail } from './firebase'; // Import the resend email function
import { toggleTheme } from './redux/themeSlice';

const SettingsPage = ({ emailVerified, setEmailSent, setIsDeletingUser }) => { // Receive setIsDeletingUser
  const dispatch = useDispatch();
  const { quizConfig } = useSelector((state) => state.quiz);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const { isDarkMode } = useSelector((state) => state.theme);

  // Local state for draft settings
  const [draftSettings, setDraftSettings] = useState(quizConfig);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showDeleteConfirmPopup, setShowDeleteConfirmPopup] = useState(false);
  const [showReauthenticatePopup, setShowReauthenticatePopup] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setDraftSettings(quizConfig);
  }, [quizConfig]);

  const handleResendEmail = async () => {
    setError(null);
    try {
      await resendVerificationEmail();
      setEmailSent(true); // Notify App.js that the email was sent
      setIsEmailSent(true);

      // Automatically hide the success message after 3 seconds
      setTimeout(() => {
        setIsEmailSent(false);
      }, 3000);
    } catch (err) {
      console.error('Error resending verification email:', err);
      setError('Wait at least 1 minute before resending the email.');

      // Automatically hide the error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  // Update the body class when the theme changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleResetHistory = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmReset = async () => {
    setShowConfirmPopup(false);
    try {
      if (!user || !user.uid) {
        console.error('User not logged in or user ID missing.');
        return;
      }
      const q = query(collection(db, 'results'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      dispatch(resetUserHistory());
      console.log('User history reset successfully!');
    } catch (error) {
      console.error('Error resetting user history:', error);
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
    setIsDeletingUser(true); // Set isDeletingUser to true before deleting
    try {
      await deleteUser();
      await logout();
      dispatch(setUser(null)); // Clear the user state in Redux
      navigate('/login');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setShowReauthenticatePopup(true);
      } else {
        console.error('Error deleting user:', error);
      }
    } finally {
      setIsDeletingUser(false); // Set isDeletingUser to false after deleting (success or failure)
    }
  };

  const handleConfirmReauthenticate = async () => {
    setShowReauthenticatePopup(false);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting user:', error);
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
    setNewDisplayName(user.displayName);
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
      console.error('Error updating display name:', error);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
      <TopNavbar />
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <CogIcon className="h-8 w-8" />
          Settings
        </h2>

        {/* Warning Icon and Resend Button */}
        {isAuthenticated && user && !emailVerified && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative group">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500 cursor-pointer" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-yellow-500 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Your email is not verified. Please verify your email to access all features.
                </span>
              </div>
              <button
                onClick={handleResendEmail}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm flex items-center gap-2"
              >
                Resend Verification Email
              </button>
            </div>
            {/* Display the messages under the button */}
            {isEmailSent && (
              <p className="text-green-500 text-sm mt-2">Verification email sent successfully!</p>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}

        {/* User Information Section */}
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
                  <button onClick={handleSaveName} className="text-green-500 hover:text-green-600">
                    <CheckIcon className="h-5 w-5" />
                  </button>
                  <button onClick={handleCancelEditName} className="text-red-500 hover:text-red-600">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <span>{user.displayName}</span>
                  <button onClick={handleEditName} className="text-blue-500 hover:text-blue-600">
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

        {/* Other Settings */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PaintBrushIcon className="h-6 w-6" />
            Appearance
          </h3>
          {/* Theme Toggle Section */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              {/* Sun Icon (Light Mode) */}
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-full focus:outline-none transition-colors duration-300 ${
                  !isDarkMode
                    ? 'bg-yellow-400 text-white shadow-md' // Highlight if light mode is active
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <SunIcon className="h-6 w-6" />
              </button>

              {/* Moon Icon (Dark Mode) */}
              <button
                onClick={handleThemeToggle}
                className={`p-2 rounded-full focus:outline-none transition-colors duration-300 ${
                  isDarkMode
                    ? 'bg-gray-800 text-white shadow-md' // Highlight if dark mode is active
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <MoonIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Reset History Button */}
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

        {/* Delete Account Button */}
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
      {/* Confirm Popups */}
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
