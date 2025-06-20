// src/RegisterPage.js
import React, { useState, useEffect } from "react";
import { registerWithEmailAndPassword } from "./firebase";
import { useNavigate, Link } from "react-router-dom";
import { setUser } from "./redux/userSlice";
import { useDispatch } from "react-redux";
import useSerializeUser from "./hooks/useSerializeUser"; // Import useSerializeUser
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { storage } from "./firebase"; // Import storage and resendVerificationEmail
import { ref, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions

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
  const [acceptTerms, setAcceptTerms] = useState(false); // State for terms checkbox
  const [showTermsPopup, setShowTermsPopup] = useState(false); // State for popup visibility
  const [termsContent, setTermsContent] = useState(""); // State to hold fetched HTML content
  const [isLoadingTerms, setIsLoadingTerms] = useState(false); // State for loading terms

  // Replace with the actual download URL from Firebase Storage

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

    if (!acceptTerms) {
      setError("You must accept the Terms and Conditions to register.");
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
      if (err.code === "auth/email-already-in-use") {
        // Handle the specific Firebase error for existing email
        setError(
          "This email is already registered. Please use a different email."
        );
      } else {
        setError("Registration failed. Please try again."); // Generic error for other issues
      }
      console.error("Registration failed:", err);
    } finally {
      setIsRegistering(false); // Set isRegistering to false after registration (success or failure)
    }
  };

  // Function to fetch Terms and Conditions from Firebase Storage
  const fetchTermsAndConditions = async () => {
    if (termsContent) {
      // If already fetched, just show the popup
      setShowTermsPopup(true);
      return;
    }

    setIsLoadingTerms(true);
    try {
      const storageRef = ref(storage, "policies/termsandconditions.html");
      const url = await getDownloadURL(storageRef);
      // Use the direct download URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      setTermsContent(html);
      setShowTermsPopup(true); // Show popup after fetching
    } catch (error) {
      console.error("Error fetching Terms and Conditions:", error);
      setError("Could not load Terms and Conditions. Please try again later.");
    } finally {
      setIsLoadingTerms(false);
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
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
            required
          />
          {/* Terms and Conditions Checkbox and Link */}
          <div className="flex items-center">
            <input
              id="accept-terms"
              name="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-indigo-600"
            />
            <label
              htmlFor="accept-terms"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              I agree to the{" "}
              <button
                type="button"
                onClick={fetchTermsAndConditions}
                className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoadingTerms}
              >
                {isLoadingTerms ? "Loading..." : "Terms and Conditions"}
              </button>
            </label>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center mt-1 mb-1">
            {" "}
            {/* Adjusted margins and text style */}
            After registration, a verification link will be sent to your email.
          </p>
          <button
            type="submit"
            disabled={!acceptTerms}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md"
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

      {/* Terms and Conditions Popup */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full h-3/4 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Terms and Conditions
              </h3>
              <button
                onClick={() => setShowTermsPopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow text-gray-700 dark:text-gray-300">
              {isLoadingTerms ? (
                <p>Loading...</p>
              ) : (
                <div
                  className="policy-content"
                  dangerouslySetInnerHTML={{ __html: termsContent }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
