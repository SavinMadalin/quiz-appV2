import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "./firebase"; // Adjust the import path as needed
import TopNavbar from "./components/TopNavbar"; // Import TopNavbar
import Spinner from "./Spinner"; // Import Spinner for loading state

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oobCode, setOobCode] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For form submission loading
  const [isVerifyingCode, setIsVerifyingCode] = useState(true); // For initial code verification

  const location = useLocation();
  const navigate = useNavigate();

  // --- Get oobCode from URL and verify it on component mount ---
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("oobCode");

    if (code) {
      setOobCode(code);
      verifyCode(code);
    } else {
      setError("Invalid request. Missing password reset code.");
      setIsVerifyingCode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // Dependency array is correct

  // --- Function to verify the oobCode ---
  const verifyCode = async (code) => {
    setIsVerifyingCode(true);
    setError("");
    try {
      await verifyPasswordResetCode(auth, code);
      console.log("Password reset code verified successfully.");
    } catch (err) {
      console.error("Error verifying password reset code:", err);
      if (err.code === "auth/expired-action-code") {
        setError(
          "This password reset link has expired. Please request a new one."
        );
      } else if (err.code === "auth/invalid-action-code") {
        setError(
          "This password reset link is invalid or has already been used. Please request a new one."
        );
      } else {
        setError(
          "Could not verify the password reset request. Please try again or request a new link."
        );
      }
      setOobCode(null); // Invalidate the code if verification fails
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      // Firebase default minimum is 8
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!oobCode) {
      setError("Cannot reset password without a valid reset code.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessMessage(
        "Your password has been reset successfully! You can now log in with your new password."
      );
      setNewPassword("");
      setConfirmPassword("");
      // Optionally navigate after delay: setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error("Error confirming password reset:", err);
      if (err.code === "auth/weak-password") {
        setError("The new password is too weak. Please choose a stronger one.");
      } else if (
        err.code === "auth/expired-action-code" ||
        err.code === "auth/invalid-action-code"
      ) {
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      } else {
        setError(
          "An error occurred while resetting your password. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  // Display loading spinner during initial code verification
  if (isVerifyingCode) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white p-6 pt-12 pb-20 lg:pl-28">
        <TopNavbar />
        <Spinner />
      </div>
    );
  }

  return (
    // Apply the same outer layout as LoginPage/RegisterPage
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white p-6 pt-12 pb-20 lg:pl-28">
      <TopNavbar />
      {/* Apply the same inner container styling */}
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Reset Your Password
        </h2>

        {/* Error and Success Messages Styling */}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {successMessage && (
          <div className="text-green-500 mb-4 text-center">
            {successMessage}
          </div>
        )}

        {/* Show form only if code is valid and password hasn't been successfully reset yet */}
        {oobCode && !successMessage && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input field styling */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium mb-1"
              >
                New Password:
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter new password"
                className="w-full p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirm New Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Confirm new password"
                className="w-full p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Button styling */}
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Navigation buttons/links styling */}
        <div className="mt-4 text-center flex flex-col gap-2">
          {successMessage && (
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:text-blue-600 underline"
            >
              Go to Login
            </button>
          )}
          {/* Show 'Request New Link' only on specific errors */}
          {(error.includes("expired") || error.includes("invalid")) && (
            <button
              onClick={() => navigate("/login")} // Navigate to login page where 'Forgot Password?' exists
              className="text-sm text-blue-500 hover:text-blue-600 underline"
            >
              Request New Reset Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
