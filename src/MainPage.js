// src/MainPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { CheckCircleIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { storage } from "./firebase"; // Import storage from firebase.js
import { ref, getDownloadURL } from "firebase/storage"; // Import storage functions
// Removed QuestionGenerator import as it's not used here
import { AndroidLogo } from "./components/Logos";
import Spinner from "./Spinner"; // Import Spinner

const EmailSentPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  console.log("EmailSentPopup rendered");
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-md shadow-lg z-50 flex items-center gap-2">
      <CheckCircleIcon className="h-6 w-6" />
      Verification email sent!
    </div>
  );
};

const MainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [randomTip, setRandomTip] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [tipsAndTricks, setTipsAndTricks] = useState([]); // Add tipsAndTricks state

  useEffect(() => {
    if (location.state?.isEmailSent) {
      setShowPopup(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  useEffect(() => {
    const fetchTipsAndTricks = async () => {
      setIsLoading(true); // Start loading
      try {
        const storageRef = ref(storage, "tips/tips.json"); // Reference to the JSON file in Firebase Storage
        const url = await getDownloadURL(storageRef); // Get the download URL
        const response = await fetch(url); // Fetch the JSON data
        if (!response.ok) throw new Error("Failed to fetch tips"); // Check response status
        const data = await response.json(); // Parse the JSON data
        setTipsAndTricks(data); // Set the tips and tricks data
      } catch (error) {
        console.error("Error fetching tips and tricks:", error);
        // Handle error (e.g., display an error message to the user)
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchTipsAndTricks();
  }, []);

  useEffect(() => {
    // Select a random tip when the component mounts or tips data changes
    if (tipsAndTricks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tipsAndTricks.length);
      setRandomTip(tipsAndTricks[randomIndex]);
    }
  }, [tipsAndTricks]);

  return (
    // Adjusted padding: p-4 default, sm:p-6 for slightly larger screens
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      {showPopup && <EmailSentPopup onClose={() => setShowPopup(false)} />}

      {/* Hero Section */}
      {/* Adjusted padding: p-6 default, sm:p-8 for larger screens. Reduced mb-8 */}
      <section className="bg-white dark:bg-dark-grey p-6 sm:p-8 rounded-lg shadow-lg max-w-4xl w-full mt-8 mb-8">
        <div className="text-center">
          {/* Adjusted heading size: text-4xl default, sm:text-5xl, lg:text-6xl. Reduced mb-3 */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-3">
            <span className="text-yellow-400">Dev</span>
            <span className="text-black dark:text-white">Prep</span>
          </h1>
          {/* Adjusted paragraph size: text-base default, sm:text-lg. Reduced mb-6 */}
          <p className="text-base sm:text-lg mb-6">
            Ace your tech interviews with our targeted quizzes and expert tips.
          </p>
          {/* Start Button & Download Button */}
          {/* Adjusted button padding/text size: py-2 px-5 text-sm default, sm:py-3 sm:px-6 sm:text-base */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            {" "}
            {/* Reduced gap */}
            <Link
              to="/quiz-config"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 text-sm sm:py-3 sm:px-6 sm:text-base rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center w-fit"
            >
              Start
              {/* Adjusted icon size: h-4 w-4 default, sm:h-5 sm:w-5 */}
              <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
            </Link>
            <a
              href="https://firebasestorage.googleapis.com/v0/b/myproject-6969b.firebasestorage.app/o/app-release.apk?alt=media&token=867796c5-811b-4aec-ae20-cb8ae3a80c93"
              target="_blank"
              rel="noopener noreferrer"
              download
              // Adjusted padding/text size: py-2 px-4 text-xs default, sm:py-2 sm:px-5 sm:text-sm
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 text-xs sm:py-2 sm:px-5 sm:text-sm rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 w-fit"
            >
              {/* Adjusted icon size: h-4 w-4 default, sm:h-5 sm:w-5 */}
              <AndroidLogo className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Download
              app for Android
            </a>
          </div>
        </div>
      </section>

      {/* Random Tip Section */}
      {/* Adjusted mb-8 */}
      {randomTip && !isLoading && (
        <section className="max-w-4xl w-full mb-8">
          {/* Adjusted padding: p-6 default, sm:p-8 */}
          <div className="bg-white dark:bg-dark-grey p-6 sm:p-8 rounded-lg shadow-lg">
            {/* Adjusted mb-4 */}
            <div className="flex items-center mb-4">
              {/* Adjusted icon size: h-6 w-6 default, sm:h-8 sm:w-8 */}
              <LightBulbIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400 mr-2" />
              {/* Adjusted heading size: text-xl default, sm:text-2xl, lg:text-3xl */}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                Tip & Trick
              </h2>
            </div>
            {/* Adjusted padding p-3 default, sm:p-4 */}
            <div className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow duration-300">
              {/* Adjusted heading size: text-base default, sm:text-lg. Reduced mb-1 */}
              <h3 className="font-semibold text-base sm:text-lg mb-1">
                {randomTip.title}
              </h3>
              {/* Adjusted text size: text-xs default, sm:text-sm. Reduced mb-1 */}
              <p className="text-xs sm:text-sm mb-1">{randomTip.description}</p>
              {/* Adjusted text size: text-xs default, sm:text-sm */}
              <a
                href={randomTip.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs sm:text-sm"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Loading Spinner */}
      {isLoading && <Spinner />}

      <Navbar />
    </div>
  );
};

export default MainPage;
