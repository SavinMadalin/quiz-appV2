// src/MainPage.js
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import TopNavbar from "./components/TopNavbar";
import { CheckCircleIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { storage } from "./firebase"; // Import storage from firebase.js
import { ref, getDownloadURL } from "firebase/storage"; // Import storage functions

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
    // Select a random tip when the component mounts
    if (tipsAndTricks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tipsAndTricks.length);
      setRandomTip(tipsAndTricks[randomIndex]);
    }
  }, [tipsAndTricks]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-blue-500 dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
      <TopNavbar />
      {showPopup && <EmailSentPopup onClose={() => setShowPopup(false)} />}

      <Navbar />

      {/* Hero Section */}
      <section className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-4xl w-full mt-20 mb-12">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold mb-4">
            <span className="text-yellow-400">Dev</span>
            <span className="text-blue-500">Prep</span>
          </h1>
          <p className="text-lg mb-8">
            Ace your tech interviews with our targeted quizzes and expert tips.
          </p>
          {/* Start Button */}
          <div className="flex justify-center">
            <Link
              to="/quiz-config"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center w-fit"
            >
              Start
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Random Tip Section */}
      {randomTip && !isLoading && (
        <section className="max-w-4xl w-full mb-12">
          <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
              <LightBulbIcon className="h-8 w-8 text-yellow-400 mr-2" />
              <h2 className="text-3xl font-bold">Tip & Trick</h2>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-semibold text-lg mb-2">{randomTip.title}</h3>
              <p className="text-sm mb-2">{randomTip.description}</p>
              <a
                href={randomTip.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
      )}
      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-light-blue-matte dark:border-blue-400"></div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
