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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-12">
      {" "}
      {/* Reduced overall padding on small screens */}
      <TopNavbar />
      {/* Reduced padding p-6, max-w-sm */}
      <div className="bg-white dark:bg-dark-grey p-6 rounded-lg shadow-lg max-w-sm w-full mt-8">
        {/* Reduced title size text-2xl, mb-4 */}
        <h1 className="text-2xl font-bold mb-4 text-center">Quiz Completed!</h1>

        {/* Display Pass/Fail status and message */}
        {/* Reduced mb-4 */}
        <div className="flex items-center justify-center mb-4">
          {isPassed ? (
            <div className="flex items-center text-center">
              {/* Reduced icon size h-6 w-6, mr-1 */}
              <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 mr-1" />
              <div className="flex flex-col">
                {/* Reduced text size text-xl */}
                <h2 className="text-xl font-bold text-green-500 dark:text-green-400">
                  Passed
                </h2>
                {/* Reduced text size text-sm */}
                <p className="text-sm text-green-500 dark:text-green-400">
                  Good job!
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-center">
              {/* Reduced icon size h-6 w-6, mr-1 */}
              <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400 mr-1" />
              <div className="flex flex-col">
                {/* Reduced text size text-xl */}
                <h2 className="text-xl font-bold text-red-500 dark:text-red-400">
                  Failed
                </h2>
                {/* Reduced text size text-sm */}
                <p className="text-sm text-red-500 dark:text-red-400">
                  Don't worry, keep practicing!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reduced gap-4, mb-6 */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Correct Answers */}
          {/* Reduced padding p-3, space-x-3 */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-green-500 dark:border-green-700">
            {/* Reduced icon size h-8 w-8 */}
            <CheckCircleIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
            <div>
              {/* Reduced text size text-sm */}
              <p className="text-sm font-medium">Correct Answers</p>
              {/* Reduced text size text-lg */}
              <p className="text-lg font-bold">{correctAnswers}</p>
            </div>
          </div>

          {/* Incorrect Answers */}
          {/* Reduced padding p-3, space-x-3 */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-red-500 dark:border-red-700">
            {/* Reduced icon size h-8 w-8 */}
            <XCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
            <div>
              {/* Reduced text size text-sm */}
              <p className="text-sm font-medium">Incorrect Answers</p>
              {/* Reduced text size text-lg */}
              <p className="text-lg font-bold">{incorrectAnswers}</p>
            </div>
          </div>

          {/* Percentage */}
          {/* Reduced padding p-3, space-x-3 */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-blue-500 dark:border-blue-700">
            {/* Reduced icon size h-8 w-8 */}
            <ChartPieIcon className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            <div>
              {/* Reduced text size text-sm */}
              <p className="text-sm font-medium">Percentage</p>
              {/* Reduced text size text-lg */}
              <p className="text-lg font-bold">{percentage}%</p>
            </div>
          </div>
        </div>
        {/* Reduced gap-3 */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Retake Quiz Button */}
          {/* Reduced padding py-2 px-4, text-sm */}
          <button
            onClick={handleRetakeQuiz}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-sm"
          >
            {/* Reduced icon size h-4 w-4, mr-1 */}
            <ArrowPathIcon className="h-4 w-4 mr-1 inline-block" />
            Retake Quiz
          </button>
          {/* Go Home Button */}
          {/* Reduced padding py-2 px-4, text-sm */}
          <Link
            to="/"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-sm" // Use flex-1 for equal width
            onClick={handleGoHome}
          >
            {/* Reduced icon size h-4 w-4, mr-1 */}
            <ArrowLeftIcon className="h-4 w-4 mr-1 inline-block" />
            Go Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
