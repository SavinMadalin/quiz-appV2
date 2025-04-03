// src/ConfirmationPage.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { resendVerificationEmail } from "./firebase"; // Import resendVerificationEmail from firebase/auth
import { FirebaseError } from "firebase/app";

const ConfirmationPage = () => {
  const location = useLocation();
  const email = location.state?.email; // Get the email from the location state
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeToWait, setTimeToWait] = useState(0); // New state for time to wait
  const [hasToWait, setHasToWait] = useState(false); // New state for has to wait

  useEffect(() => {
    if (error || isEmailSent) {
      const timer = setTimeout(() => {
        setError(null);
        setIsEmailSent(false);
      }, 5000); // Clear the error and the success message after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, isEmailSent]);

  useEffect(() => {
    if (hasToWait && timeToWait > 0) {
      const timer = setInterval(() => {
        setTimeToWait((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (hasToWait && timeToWait === 0) {
      setHasToWait(false);
    }
  }, [hasToWait, timeToWait]);

  const handleResendEmail = async () => {
    setError(null);
    setIsEmailSent(false);
    setIsLoading(true);
    try {
      // Send the verification email again
      await resendVerificationEmail(email);
      setIsEmailSent(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/too-many-requests") {
          setError(
            "Too many requests. Please wait a few minutes before trying again."
          );
          setTimeToWait(60); // Set the time to wait to 60 seconds
          setHasToWait(true);
        } else if (err.code === "auth/user-not-found") {
          setError("This email is not registered.");
        } else if (err.code === "auth/operation-not-allowed") {
          setError("This email is not registered with email/password.");
        } else {
          setError("Error sending verification email. Please try again.");
          console.error("Error sending verification email:", err);
        }
      } else {
        setError("Error sending verification email. Please try again.");
        console.error("Error sending verification email:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-500 dark:bg-dark-blue-matte text-light-text dark:text-white p-6">
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Confirm Your Email
        </h2>
        <p className="mb-4">
          Registration successful! Please check your email (<b>{email}</b>) to
          verify your account.
        </p>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {isEmailSent && (
          <div className="text-green-500 mb-4">Verification email sent!</div>
        )}
        {hasToWait && (
          <div className="text-yellow-500 mb-4">
            Please wait {timeToWait} seconds before trying again.
          </div>
        )}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleResendEmail}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
              isLoading || hasToWait ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading || hasToWait}
          >
            Resend Verification Email
          </button>
          <Link
            to="/login"
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out text-center"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
