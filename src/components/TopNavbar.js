// src/components/TopNavbar.js
import React, { useState, useEffect, useRef } from "react";
import { logout as firebaseLogout } from "../firebase";
import { useSelector } from "react-redux";
import {
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid"; // <-- Import Solid StarIcon
import { GoogleLogo } from "../components/Logos";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { useSubscription } from "../contexts/SubscriptionContext"; // <-- Import useSubscription

// Simple Apple Logo Placeholder (replace with a better SVG if you have one)
const AppleLogo = ({ className }) => (
  // ... (AppleLogo component remains the same)
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19.1 12.75C19.1 11.19 20.16 10.41 20.28 10.35C19.32 8.85 17.94 8.19 16.86 8.13C15.3 8.01 13.95 8.91 13.26 8.91C12.57 8.91 11.52 8.01 10.08 8.1C8.85 8.16 7.65 8.82 6.84 9.99C5.07 12.45 6.06 16.53 7.83 18.99C8.7 20.16 9.78 21.48 11.19 21.48C12.54 21.48 13.05 20.73 14.58 20.73C16.11 20.73 16.56 21.48 18.03 21.45C19.44 21.42 20.37 20.16 21.18 18.96C19.83 18.15 19.11 16.5 19.11 14.79C19.11 14.79 19.1 12.75 19.1 12.75ZM15.03 6.87C15.84 5.97 16.35 4.74 16.23 3.51C14.97 3.6 13.83 4.35 13.05 5.25C12.33 6.09 11.76 7.35 11.91 8.58C13.23 8.55 14.28 7.77 15.03 6.87Z" />
  </svg>
);

const TopNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.user);
  const { isPremium } = useSubscription(); // <-- Get premium status

  // ... (handleLogin, handleLogout, toggleDropdown, handleOutsideClick, useEffect remain the same) ...
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
      console.error("Logout failed:", error);
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
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const formatUserName = (name) => {
    if (!name) return "";
    const firstSpaceIndex = name.indexOf(" ");
    if (name.length <= 10) {
      return name;
    } else if (firstSpaceIndex > 0 && firstSpaceIndex <= 10) {
      return name.substring(0, firstSpaceIndex);
    } else {
      return name.substring(0, 10) + "...";
    }
  };

  return (
    <div
      className={classNames(
        "p-6 fixed top-0 left-0 right-0 z-50 flex flex-row justify-between items-center h-12 md:h-12 pt-6",
        "bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700"
      )}
    >
      {/* ... (Logo remains the same) ... */}
      <div className="text-4xl font-extrabold tracking-tight">
        <span className="text-yellow-400">Dev</span>
        <span className="text-gray-800 dark:text-white lg:text-gray-800 lg:dark:text-white">
          Prep
        </span>
      </div>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          className={classNames(
            "inline-flex justify-center items-center w-full sm:w-auto h-12 rounded-md px-4 py-3 text-base font-semibold bg-transparent", // Adjusted sm:w-32 to sm:w-auto for flexibility
            "text-gray-800 dark:text-white",
            "hover:bg-transparent lg:hover:bg-gray-300 lg:dark:hover:bg-gray-700"
          )}
          onClick={toggleDropdown}
          id="options-menu"
        >
          {user ? (
            <div className="flex items-center gap-2">
              {/* Email Verification Warning */}
              {!user.emailVerified && (
                <div className="relative group">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-1 cursor-pointer" />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max bg-red-500 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Verify your email for accessing all the features.
                    <br /> See settings.
                  </span>
                </div>
              )}
              {/* User Icon */}
              <UserCircleIcon
                className={classNames(
                  "h-6 w-6",
                  "text-gray-800 dark:text-white"
                )}
              />
              {isPremium && (
                <div className="relative group ml-1">
                  {" "}
                  {/* Added ml-1 for spacing */}
                  <SolidStarIcon className="h-4 w-4 text-yellow-400" />
                </div>
              )}
              {/* Username */}
              <span
                className={classNames(
                  "truncate", // Keep truncate
                  "text-gray-800 dark:text-white"
                )}
              >
                {formatUserName(user.displayName)}
              </span>{" "}
            </div>
          ) : (
            <span className={classNames("text-gray-800 dark:text-white")}>
              Login
            </span>
          )}
          {/* Dropdown Arrow */}
          {isDropdownOpen ? (
            <ChevronUpIcon
              className={classNames(
                "-mr-1 ml-2 h-5 w-5",
                "text-gray-800 dark:text-white"
              )}
              aria-hidden="true"
            />
          ) : (
            <ChevronDownIcon
              className={classNames(
                "-mr-1 ml-2 h-5 w-5",
                "text-gray-800 dark:text-white"
              )}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-full sm:w-48 rounded-md bg-white shadow-lg dark:bg-dark-grey ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none z-20"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {user ? (
              // Logout Button
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="block w-full h-12 px-4 py-2 text-sm text-red-400 bg-white dark:bg-dark-grey rounded-md flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200"
                  style={{ width: "100%", maxWidth: "100%" }}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-400" />
                  Logout
                </button>
              </div>
            ) : (
              // Login Buttons
              <div className="py-1 flex flex-col">
                {/* Email Login Link */}
                <Link
                  to="/login"
                  className="block w-full sm:w-48 h-12 px-4 py-2 bg-white text-sm text-gray-700 dark:bg-dark-grey dark:text-gray-300 flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200"
                >
                  <EnvelopeIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />{" "}
                  <span className="sm:hidden"></span>
                  <span className="hidden sm:inline">Login with Email</span>
                </Link>
                {/* Google Login Button (Disabled) */}
                <div className="relative group">
                  <button
                    disabled
                    className="block w-full sm:w-48 h-12 px-4 py-2 bg-white text-sm text-gray-700 dark:bg-dark-grey dark:text-gray-300 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                  >
                    <GoogleLogo className="h-3 w-3 text-gray-700 dark:text-gray-300" />{" "}
                    <span className="sm:hidden"></span>
                    <span className="hidden sm:inline">Login with Google</span>
                  </button>
                </div>
                {/* Apple Login Button (Disabled) */}
                <div className="relative group">
                  <button
                    disabled
                    className="block w-full sm:w-48 h-12 px-4 py-2 bg-white text-sm text-gray-700 dark:bg-dark-grey dark:text-gray-300 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                  >
                    <AppleLogo className="h-5 w-5 text-gray-700 dark:text-gray-300" />{" "}
                    <span className="sm:hidden"></span>
                    <span className="hidden sm:inline">Login with Apple</span>
                  </button>
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                    This will be available soon
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNavbar;
