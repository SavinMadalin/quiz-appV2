// src/ResultPage.js
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { resetQuiz } from "./redux/quizSlice";
import {
  CheckCircleIcon,
  XCircleIcon,
  ChartPieIcon,
  ArrowLeftIcon,
  ArrowPathIcon, // Import the refresh icon
} from "@heroicons/react/24/outline"; // Import icons
import InterviewResultPage from "./components/InterviewResultPage";
import TopNavbar from "./components/TopNavbar";

const ResultPage = () => {
  const { score, quizConfig } = useSelector((state) => state.quiz);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const numQuestions = quizConfig.isMockInterviewMode ? 15 : 10;

  const correctAnswers = score;
  const incorrectAnswers = numQuestions - correctAnswers;
  const percentage = ((correctAnswers / numQuestions) * 100).toFixed(0); // Calculate percentage and round to 0 decimals
  const isPassed = percentage >= 80; // Determine if the user has passed

  const handleGoHome = () => {
    dispatch(resetQuiz());
  };

  const handleRetakeQuiz = () => {
    dispatch(resetQuiz()); // Reset score, current question, etc., but keep config
    navigate("/quiz"); // Navigate back to the quiz page to start again
  };

  if (quizConfig.isMockInterviewMode) {
    return <InterviewResultPage />;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Quiz Completed!
        </h1>
        {/* Display Pass/Fail status and message */}
        {/* Reduced mb-4 */}
        <div className="flex items-center justify-center mb-4">
          {isPassed ? (
            <div className="flex items-center text-center">
              {/* Reduced icon size h-6 w-6, mr-1 */}
              <CheckCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-500 dark:text-green-400 mr-2" />
              <div className="flex flex-col">
                {/* Reduced text size text-xl */}
                <h2 className="text-xl sm:text-2xl font-bold text-green-500 dark:text-green-400">
                  Passed
                </h2>
                {/* Reduced text size text-sm */}
                <p className="text-sm sm:text-base text-green-500 dark:text-green-400">
                  Good job!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-center">
              {/* Reduced icon size h-6 w-6, mr-1 */}
              <XCircleIcon className="h-8 w-8 sm:h-10 sm:w-10 text-red-500 dark:text-red-400 mr-2" />
              <div className="flex flex-col">
                {/* Reduced text size text-xl */}
                <h2 className="text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400">
                  Failed
                </h2>
                {/* Reduced text size text-sm */}
                <p className="text-sm sm:text-base text-red-500 dark:text-red-400">
                  Don't worry, keep practicing!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reduced gap-4, mb-6 */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-8">
          {/* Correct Answers */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-700/20">
            <CheckCircleIcon className="h-7 w-7 sm:h-8 sm:w-8 text-green-500 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
                Correct Answers
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                {correctAnswers}
              </p>
            </div>
          </div>

          {/* Incorrect Answers */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-700/20">
            <XCircleIcon className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
                Incorrect Answers
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                {incorrectAnswers}
              </p>
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 border-indigo-500 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-700/20">
            <ChartPieIcon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
            <div>
              <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200">
                Percentage
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                {percentage}%
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {/* Retake Quiz Button */}
          {/* Reduced padding py-2 px-4, text-sm */}
          <button
            onClick={handleRetakeQuiz}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-sm sm:text-base"
          >
            {/* Reduced icon size h-4 w-4, mr-1 */}
            <ArrowPathIcon className="h-5 w-5 mr-1.5 inline-block" />
            Retake Quiz
          </button>
          {/* Go Home Button */}
          <Link
            to="/"
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-sm sm:text-base"
            onClick={handleGoHome}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1.5 inline-block" />
            Go Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
