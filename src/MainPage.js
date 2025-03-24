// src/MainPage.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import TopNavbar from './components/TopNavbar';
import { CheckCircleIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const EmailSentPopup = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-4 rounded-md shadow-lg z-50 flex items-center gap-2">
      <CheckCircleIcon className="h-6 w-6" />
      Verification email sent!
    </div>
  );
};

const MainPage = () => {
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [randomTip, setRandomTip] = useState(null);

  useEffect(() => {
    if (location.state?.isEmailSent) {
      setShowPopup(true);
    }
  }, [location.state]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Sample tips and tricks data (you can replace this with data from an API or a JSON file)
  const tipsAndTricks = [
    {
      title: 'Master the STAR Method',
      description: 'When answering behavioral questions, use the STAR method (Situation, Task, Action, Result) to structure your responses.',
      link: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique',
    },
    {
      title: 'Practice Coding Challenges',
      description: 'Regularly practice coding challenges on platforms like LeetCode or HackerRank to improve your problem-solving skills.',
      link: 'https://leetcode.com/',
    },
    {
      title: 'Research the Company',
      description: 'Before your interview, thoroughly research the company, its products, and its culture.',
      link: 'https://www.glassdoor.com/index.htm',
    },
    {
      title: 'Prepare Questions to Ask',
      description: 'Prepare thoughtful questions to ask the interviewer. This shows your interest and engagement.',
      link: 'https://www.themuse.com/advice/51-interview-questions-you-should-be-asking',
    },
    {
      title: 'Review Data Structures and Algorithms',
      description: 'Brush up on common data structures and algorithms, as they are frequently tested in technical interviews.',
      link: 'https://www.geeksforgeeks.org/data-structures/',
    },
  ];

  useEffect(() => {
    // Select a random tip when the component mounts
    const randomIndex = Math.floor(Math.random() * tipsAndTricks.length);
    setRandomTip(tipsAndTricks[randomIndex]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
      {showPopup && <EmailSentPopup onClose={handleClosePopup} />}
      <TopNavbar />
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
          <Link
            to="/quiz-config"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 inline-flex items-center"
          >
            Start a Quiz <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Random Tip Section */}
      {randomTip && (
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
    </div>
  );
};

export default MainPage;
