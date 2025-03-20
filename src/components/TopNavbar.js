// src/components/TopNavbar.js
import React, { useState, useEffect, useRef } from 'react';
import { loginWithGoogle, logout as firebaseLogout, resendVerificationEmail, auth } from '../firebase';
import { useSelector } from 'react-redux';
import {
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon, // Import EnvelopeIcon
} from '@heroicons/react/24/outline';
import { GoogleLogo } from '../components/Logos';
import { Link } from 'react-router-dom'; // Import Link
import { FirebaseError } from 'firebase/app';

const TopNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.user);
  const [error, setError] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleLogin = async (loginFunction, providerName) => {
    try {
      await loginFunction();
      console.log(`User logged in with ${providerName}!`);
    } catch (error) {
      console.error(`Login with ${providerName} failed:`, error);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOutsideClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleResendEmail = async () => {
    setError(null);
    setIsEmailSent(false);
    try {
      // Send the verification email again
      await resendVerificationEmail(auth.currentUser);
      setIsEmailSent(true);
    } catch (err) {
      if (err instanceof FirebaseError && err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError('Error sending verification email. Please try again.');
        console.error('Error sending verification email:', err);
      }
    }
  };

  useEffect(() => {
    if (error || isEmailSent) {
      const timer = setTimeout(() => {
        setError(null);
        setIsEmailSent(false);
      }, 5000); // Clear the error and the success message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, isEmailSent]);

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900 border-b border-gray-300 dark:border-gray-700 p-6 fixed top-0 left-0 right-0 z-50 flex flex-col sm:flex-row justify-between items-center backdrop-blur-sm bg-opacity-50 dark:bg-opacity-30">
      {/* App Name */}
      <div className="text-3xl font-bold text-white tracking-tight mb-2 sm:mb-0">
        Quiz App
      </div>

      {/* Login/Logout Dropdown */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* Login/User Button */}
        <button
          type="button"
          className="inline-flex justify-center items-center w-full rounded-md border border-gray-500 dark:border-gray-700 px-6 py-3 bg-white text-base font-semibold text-gray-800 dark:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 transition-shadow duration-200"
          onClick={toggleDropdown}
          id="options-menu"
        >
          {user ? (
            <div className='flex items-center'>
               {/* Verification Warning */}
               {!user.emailVerified && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-1" />
                )}
               <UserCircleIcon className="h-6 w-6 mr-2 text-gray-800 dark:text-gray-900" />
                <span className="hidden sm:inline text-gray-800 dark:text-gray-900">{user.displayName}</span>
                 <span className="inline sm:hidden text-gray-800 dark:text-gray-900">User</span>
            </div>
          ) : (
            <span className="text-gray-800 dark:text-gray-900">Login</span>
          )}
          {isDropdownOpen ? (
            <ChevronUpIcon className="-mr-1 ml-2 h-5 w-5 text-gray-800 dark:text-gray-900" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-gray-800 dark:text-gray-900" aria-hidden="true" />
          )}
        </button>

        {/* Dropdown Panel */}
        {isDropdownOpen && (
          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-50 dark:bg-gray-900 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {user ? (
                <div className='py-1'>
                    {/* Resend Verification Email Button */}
                    {!user.emailVerified && (
                        <button
                            onClick={handleResendEmail}
                            className="block w-full px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:shadow-md transition-shadow duration-200"
                        >
                            <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                            Resend Verification Email
                        </button>
                    )}
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    {isEmailSent && <div className="text-green-500 mb-4">Verification email sent!</div>}
                    <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 flex items-center gap-2 hover:shadow-md transition-shadow duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 text-white"/>
                        Logout
                    </button>
                </div>
            ) : (
                <div className="py-1">
                    <button
                        onClick={() => handleLogin(loginWithGoogle, 'Google')}
                        className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:shadow-md transition-shadow duration-200"
                    >
                        <GoogleLogo className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        Login with Google
                    </button>
                    <Link to="/login" className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 hover:shadow-md transition-shadow duration-200">
                        <EnvelopeIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" /> {/* Add EnvelopeIcon */}
                        Login with Email
                    </Link>
                </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavbar;
