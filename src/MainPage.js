// src/MainPage.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { CheckCircleIcon } from '@heroicons/react/24/outline'; // Import CheckCircleIcon

const EmailSentPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-md shadow-lg z-50 flex items-center gap-2"> {/* Updated CSS classes */}
      <CheckCircleIcon className="h-6 w-6" />
      Verification email sent!
    </div>
  );
};

const MainPage = () => {
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (location.state?.isEmailSent) {
      setShowPopup(true);
    }
  }, [location.state]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
      {showPopup && <EmailSentPopup onClose={handleClosePopup} />}
      <Navbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full mt-20">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to the Quiz App!</h1>
        <p className="mb-8 text-center">
          Test your knowledge and have fun with our interactive quizzes.
        </p>
        <Link
          to="/quiz-config"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 block text-center"
        >
          Start a Quiz
        </Link>
      </div>
    </div>
  );
};

export default MainPage;
