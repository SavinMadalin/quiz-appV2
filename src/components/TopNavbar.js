import React, { useState, useEffect, useRef } from "react";
import { loginWithGoogle, logout as firebaseLogout } from "../firebase";
import { useSelector } from "react-redux";
import {
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { GoogleLogo } from "../components/Logos";
import { Link } from "react-router-dom";
import classNames from "classnames";

const TopNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.user);
  const [error, setError] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Define handleLogin here to be accessible by triggerFlutterGoogleSignIn's fallback
  const handleLogin = async (loginFunction, providerName) => {
    try {
      await loginFunction();
      console.log(`User logged in with ${providerName}!`);
    } catch (error) {
      console.error(`Login with ${providerName} failed:`, error);
    }
  };

  // --- Moved triggerFlutterGoogleSignIn INSIDE the component ---
  function triggerFlutterGoogleSignIn() {
    if (window.AuthChannel && window.AuthChannel.postMessage) {
      console.log(
        "Requesting Flutter to initiate Google Sign-In via AuthChannel"
      );
      window.AuthChannel.postMessage("initiateGoogleSignIn");
    } else {
      console.log("AuthChannel not found, using standard web flow.");
      // Now it can access handleLogin directly
      handleLogin(loginWithGoogle, "Google");
    }
  }

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

  useEffect(() => {
    if (error || isEmailSent) {
      const timer = setTimeout(() => {
        setError(null);
        setIsEmailSent(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, isEmailSent]);

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
            "inline-flex justify-center items-center w-full sm:w-32 h-12 rounded-md px-4 py-3 text-base font-semibold bg-transparent",
            "text-gray-800 dark:text-white",
            "hover:bg-transparent lg:hover:bg-gray-300 lg:dark:hover:bg-gray-700"
          )}
          onClick={toggleDropdown}
          id="options-menu"
        >
          {user ? (
            <div className="flex items-center gap-2">
              {!user.emailVerified && (
                <div className="relative group">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-1 cursor-pointer" />
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max bg-red-500 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    Verify your email for accessing all the features.
                    <br /> See settings.
                  </span>
                </div>
              )}
              <UserCircleIcon
                className={classNames(
                  "h-6 w-6",
                  "text-gray-800 dark:text-white"
                )}
              />
              <span
                className={classNames(
                  "truncate",
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

        {isDropdownOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-full sm:w-48 rounded-md bg-white shadow-lg dark:bg-dark-grey ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none z-20"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {user ? (
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="block w-full h-12 px-4 py-2 text-sm text-red-400 bg-white dark:bg-dark-grey hover:bg-light-grey dark:hover:bg-gray-700 rounded-md flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200"
                  style={{ width: "100%", maxWidth: "100%" }}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-400" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="py-1 flex flex-col">
                <button
                  onClick={triggerFlutterGoogleSignIn} // Use the combined trigger function
                  className="block w-full sm:w-48 h-12 px-4 py-2 bg-white text-sm text-gray-700 dark:bg-dark-grey dark:text-gray-300 hover:bg-light-grey dark:hover:bg-gray-700 flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200"
                >
                  <GoogleLogo className="h-5 w-5 text-gray-700 dark:text-gray-300" />{" "}
                  <span className="sm:hidden"></span>
                  <span className="hidden sm:inline">Login with Google</span>
                </button>
                <Link
                  to="/login"
                  className="block w-full sm:w-48 h-12 px-4 py-2 bg-white text-sm text-gray-700 dark:bg-dark-grey dark:text-gray-300 hover:bg-light-grey dark:hover:bg-gray-700 flex items-center justify-center gap-2 hover:shadow-md transition-shadow duration-200"
                >
                  <EnvelopeIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />{" "}
                  <span className="sm:hidden"></span>
                  <span className="hidden sm:inline">Login with Email</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNavbar;
