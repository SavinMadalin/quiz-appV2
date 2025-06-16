// src/ConfirmationPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { applyActionCode, onAuthStateChanged } from "firebase/auth"; // Import necessary functions
import { auth } from "./firebase"; // Import your Firebase auth instance
import TopNavbar from "./components/TopNavbar";
import Spinner from "./Spinner"; // Import Spinner for loading state
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

// Helper function to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ConfirmationPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(auth.currentUser); // Track current user

  // Listen for auth state changes to get the latest user status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      // If user becomes available and is verified, update status if still verifying
      if (user?.emailVerified && status === "verifying") {
        setStatus("success");
      }
    });
    return unsubscribe; // Cleanup subscription
  }, [status]); // Re-run if status changes

  useEffect(() => {
    const actionCode = query.get("oobCode");

    if (!actionCode) {
      setStatus("error");
      setErrorMessage("Invalid verification link. Code missing.");
      return;
    }

    const handleVerifyEmail = async () => {
      // Check if the email is already verified (might happen due to Firebase redirect or race condition)
      // Use a potentially updated currentUser from the auth listener
      const userToCheck = auth.currentUser || currentUser;
      if (userToCheck?.emailVerified) {
        console.log("Email already verified, showing success.");
        setStatus("success");
        return;
      }

      // If not verified, attempt to apply the code
      setStatus("verifying");
      try {
        await applyActionCode(auth, actionCode);
        setStatus("success");
        // Force a reload of the user state to get the latest emailVerified status
        await auth.currentUser?.reload();
        setCurrentUser(auth.currentUser); // Update local state too
      } catch (error) {
        console.error("Error applying action code:", error);
        // Check again if it got verified despite the error (race condition)
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          console.log(
            "Email verified despite applyActionCode error (likely race condition)."
          );
          setStatus("success");
        } else if (error.code === "auth/invalid-action-code") {
          // If the code is invalid, it might have been used by Firebase redirect OR it's truly invalid/expired
          // We optimistically assume success if the user *is* verified now.
          setStatus("error");
          setErrorMessage(
            "Verification link is invalid or has expired. Please request a new one or try logging in."
          );
        } else {
          setStatus("error");
          setErrorMessage(
            "An error occurred during email verification. Please try again later."
          );
        }
      }
    };

    handleVerifyEmail();
    // Only run this effect once on mount based on the initial query params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]); // Depend only on query

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-lg">Verifying your email...</p>
          </div>
        );
      case "success":
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your account is now verified. Enjoy!
            </p>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
            <p className="text-red-500 dark:text-red-400 mb-6">
              {errorMessage || "Could not verify your email."}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white p-6 pt-12 pb-20 lg:pl-28">
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default ConfirmationPage;
