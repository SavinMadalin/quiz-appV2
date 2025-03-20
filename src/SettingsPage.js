// src/SettingsPage.js
import { useDispatch, useSelector } from 'react-redux';
import { setQuizConfig } from './redux/quizSlice';
import { resetUserHistory } from './redux/historySlice';
import Navbar from './Navbar';
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
} from '@heroicons/react/24/outline';
import { db, deleteUser, logout, updateDisplayName } from './firebase';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import ConfirmPopup from './components/ConfirmPopup';
import { useNavigate } from 'react-router-dom';
import { setUser } from './redux/userSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { quizConfig } = useSelector((state) => state.quiz);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

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

  const handleThemeChange = (e) => {
    setDraftSettings({ ...draftSettings, theme: e.target.value });
  };

  const handleApply = () => {
    dispatch(setQuizConfig(draftSettings));
  };

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
    try {
      await deleteUser();
      await logout();
      navigate('/login');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setShowReauthenticatePopup(true);
      } else {
        console.error('Error deleting user:', error);
      }
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
      {showConfirmPopup && (
        <ConfirmPopup
          message="Do you want to clear all your quiz history?"
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
          message="For security reasons, you need to login again to delete your account."
          onConfirm={handleConfirmReauthenticate}
          onCancel={handleCancelReauthenticate}
        />
      )}
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <CogIcon className="h-8 w-8" />
          Settings
        </h2>

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

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            {' '}
            <PaintBrushIcon className="h-6 w-6" />
            Appearance
          </h3>
          <div className="mb-4">
            <label className="block font-medium mb-2">Theme:</label>
            <select
              value={draftSettings.theme}
              onChange={handleThemeChange}
              className="mt-1 p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
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
        <button
          onClick={handleApply}
          className={`w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          Apply Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
