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
    <div className="flex justify-center items-center min-h-screen bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white p-6 pt-12 pb-20 lg:pl-28">
      <TopNavbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {resetEmailSent && (
          <div className="text-green-500 mb-4">
            Password reset email sent. Please check your inbox.
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
          >
            Login
          </button>
        </form>
        <div className="mt-2 text-center">
          <button
            onClick={handleForgotPassword}
            className="text-blue-500 hover:text-blue-600 underline"
          >
            Forgot Password?
          </button>
        </div>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-600 underline"
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
