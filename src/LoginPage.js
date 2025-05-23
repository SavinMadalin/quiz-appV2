// src/LoginPage.js
import React, { useState } from "react";
import { loginWithEmailAndPassword, sendPasswordReset } from "./firebase"; // Import sendPasswordReset
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false); // New state for reset email status
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResetEmailSent(false); // Reset the reset email status

    try {
      await loginWithEmailAndPassword(email, password);
      console.log("User logged in successfully!");
      navigate("/"); // Redirect to home page after successful login
    } catch (err) {
      if (err.code === "auth/email-not-verified") {
        setError("Please verify your email before logging in."); // Custom error message
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password."); // Generic error message
      } else {
        setError("An unexpected error occurred.");
        console.error("Login failed:", err);
      }
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetEmailSent(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      // Check the trimmed email
      setError("Please enter your email address.");
      return;
    }
    try {
      await sendPasswordReset(trimmedEmail);
      setResetEmailSent(true);
    } catch (err) {
      // Catch specific Firebase errors
      if (err.code === "auth/user-not-found") {
        setError("This email is not registered."); // Set the error based on Firebase's response
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        // Generic error for other issues
        setError("Error sending password reset email. Please try again later.");
        console.error("Password reset failed:", err);
      }
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white p-4 sm:p-6 pt-16 pb-24 lg:pl-52">
      <TopNavbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Login
        </h2>
        {error && (
          <div className="text-red-500 mb-4 text-sm text-center">{error}</div>
        )}
        {resetEmailSent && (
          <div className="text-green-500 mb-4 text-sm text-center">
            Password reset email sent. Please check your inbox.
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {" "}
          {/* Increased gap */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            required
          />
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          {" "}
          {/* Increased mt */}
          <button
            onClick={handleForgotPassword}
            className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline text-sm"
          >
            Forgot Password?
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          {" "}
          {/* Increased mt and styled text */}
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-medium"
          >
            Register
          </Link>
        </p>
      </div>
      <Navbar />
    </div>
  );
};

export default LoginPage;
