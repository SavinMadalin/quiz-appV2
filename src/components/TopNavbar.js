// src/components/TopNavbar.js
import React, { useState, useEffect, useRef } from 'react';
import { loginWithGoogle, logout as firebaseLogout } from '../firebase';
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
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 dark:from-gray-800 dark:to-gray-900 border-b border-gray-300 dark:border-gray-700 p-6 fixed top-0 left-0 right-0 z-50 flex flex-row justify-between items-center backdrop-blur-sm bg-opacity-50 dark:bg-opacity-30 h-24 md:h-24 pt-16"> {/* Increased height and padding-top */}
      {/* App Name */}
      <div className="text-4xl font-extrabold text-white tracking-tight">
        <span className="text-yellow-400">Dev</span>
        <span className="text-white">Prep</span>
      </div>

      {/* Login/Logout Dropdown */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* Login/User Button */}
        <button
          type="button"
          className="inline-flex justify-center items-center w-full sm:w-32 h-12 rounded-md px-4 py-3 text-base font-semibold text-white hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500 transition-shadow duration-200 bg-transparent" // Reduced width and transparent background and white text and border-2
          onClick={toggleDropdown}
          id="options-menu"
        >
          {user ? (
            <div className='flex items-center gap-2'>
               {/* Verification Warning */}
               {!user.emailVerified && (
                 <div className="relative group">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-1 cursor-pointer" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-red-500 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Verify your email for accessing all the features. See settings.
                  </span>
                </div>                )}
               <UserCircleIcon className="h-6 w-6 text-white" />
                <span className="hidden sm:inline text-white">{user.displayName}</span>
                 <span className="inline sm:hidden text-white">User</span>
            </div>
          ) : (
            <span className="text-white">Login</span>
          )}
          {isDropdownOpen ? (
            <ChevronUpIcon className="-mr-1 ml-2 h-5 w-5 text-white" aria-hidden="true" />
          ) : (
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-white" aria-hidden="true" />
          )}
        </button>

               {/* Dropdown Panel */}
               {isDropdownOpen && (
          <div
          className="origin-top-right absolute right-0 mt-2 w-full sm:w-48 rounded-md shadow-lg bg-light-blue-matte dark:bg-gray-900 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none" // light blue background
          role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {user ? (
                    <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full h-12 px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 text-white" />
                      Logout
                    </button>
                  </div>
            ) : (
                <div className="py-1 flex flex-col"> {/* flex flex-col */}
                    <button
                        onClick={() => handleLogin(loginWithGoogle, 'Google')}
                        className="block w-full sm:w-48 h-12 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200" // Increased width and justify-start
                        >
                        <GoogleLogo className="h-5 w-5 text-gray-700 dark:text-gray-300" /> {/* Increased icon size */}
                        <span className='sm:hidden'></span>
                        <span className='hidden sm:inline'>Login with Google</span>
                    </button>
                    <Link to="/login"
                     className="block w-full sm:w-48 h-12 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200" // Increased width and justify-start
                        >  
                    <EnvelopeIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" /> {/* Increased icon size */}
                    <span className='sm:hidden'></span>
                    <span className='hidden sm:inline'>Login with Email</span>
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
