// src/RegisterPage.js
import React, { useState } from "react";
import { registerWithEmailAndPassword, checkIfEmailExists } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { setUser } from "./redux/userSlice";
import { useDispatch } from "react-redux";
import useSerializeUser from "./hooks/useSerializeUser"; // Import useSerializeUser
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";

const RegisterPage = ({ setEmailSent, setIsRegistering }) => {
  // Receive setIsRegistering
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState(""); // New state for name
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { serializeUser } = useSerializeUser(); // Use the hook

  const isValidEmail = (email) => {
    // Basic email format validation using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsRegistering(true); // Set isRegistering to true before registration

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setIsRegistering(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsRegistering(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsRegistering(false);
      return;
    }

    // Check if email exists
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      setError(
        "This email is already registered. Please use a different email."
      );
      setIsRegistering(false);
      return;
    }

    try {
      const userCredential = await registerWithEmailAndPassword(
        email,
        password,
        name
      ); // Pass name
      console.log("User registered successfully!");
      // Serialize the user object before dispatching
      const serializedUser = serializeUser(userCredential.user);
      dispatch(setUser(serializedUser)); // Dispatch the serialized user

      setEmailSent(true); // Notify App.js that the email was sent
      navigate("/", { state: { isEmailSent: true } }); // Redirect to main page and pass isEmailSent
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration failed:", err);
    } finally {
      setIsRegistering(false); // Set isRegistering to false after registration (success or failure)
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white p-4 sm:p-6 pt-16 pb-24 lg:pl-52">
      <TopNavbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Register
        </h2>
        {error && (
          <div className="text-red-500 mb-4 text-sm text-center">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {" "}
          {/* Increased gap */}
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            required
          />
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-1">
            {" "}
            {/* Adjusted margins and text style */}
            After registration, a verification link will be sent to your email.
          </p>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          {" "}
          {/* Increased mt and styled text */}
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline font-medium"
          >
            Go to Login
          </Link>
        </p>
      </div>
      <Navbar />
    </div>
  );
};

export default RegisterPage;
