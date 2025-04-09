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
    <div className="flex justify-center items-center min-h-screen bg-blue-500 dark:bg-dark-blue-matte text-light-text dark:text-white p-6 pb-20 lg:pl-28">
      <TopNavbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:text-blue-600 underline"
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
