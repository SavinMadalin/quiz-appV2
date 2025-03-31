// src/ResultPage.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { resetQuiz } from './redux/quizSlice';
import { CheckCircleIcon, XCircleIcon, ChartPieIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'; // Import icons
import InterviewResultPage from './components/InterviewResultPage';
  
const ResultPage = () => {
  const { score, quizConfig } = useSelector(state => state.quiz);
  const dispatch = useDispatch();
  const numQuestions = quizConfig.isMockInterviewMode ? 15 : 10;

  const correctAnswers = score;
  const incorrectAnswers = numQuestions - correctAnswers;
  const percentage = ((correctAnswers / numQuestions) * 100).toFixed(0); // Calculate percentage and round to 0 decimals
  const isPassed = percentage >= 80; // Determine if the user has passed

  const handleGoHome = () => {
    dispatch(resetQuiz());
  };

  if (quizConfig.isMockInterviewMode) {
    return <InterviewResultPage />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white">
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Quiz Completed!</h1>

        {/* Display Pass/Fail status and message */}
        <div className="flex items-center justify-center mb-6">
          {isPassed ? (
            <div className="flex items-center text-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 dark:text-green-400 mr-2" /> {/* Smaller icon with mr-2 */}
              <div className='flex flex-col'>
                <h2 className="text-2xl font-bold text-green-500 dark:text-green-400">Passed</h2>
                <p className="text-green-500 dark:text-green-400">Good job!</p>
              </div>

            </div>
          ) : (
            <div className="flex items-center text-center">
              <XCircleIcon className="h-8 w-8 text-red-500 dark:text-red-400 mr-2" /> {/* Smaller icon with mr-2 */}
              <div className='flex flex-col'>
                <h2 className="text-2xl font-bold text-red-500 dark:text-red-400">Failed</h2>
                <p className="text-red-500 dark:text-red-400">Don't worry, keep practicing!</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Correct Answers */}
          <div className="flex items-center space-x-4 p-4 rounded-lg border border-green-500 dark:border-green-700">
            <CheckCircleIcon className="h-10 w-10 text-green-500 dark:text-green-400" />
            <div>
              <p className="font-medium">Correct Answers</p>
              <p className="text-xl font-bold">{correctAnswers}</p>
            </div>
          </div>

          {/* Incorrect Answers */}
          <div className="flex items-center space-x-4 p-4 rounded-lg border border-red-500 dark:border-red-700">
            <XCircleIcon className="h-10 w-10 text-red-500 dark:text-red-400" />
            <div>
              <p className="font-medium">Incorrect Answers</p>
              <p className="text-xl font-bold">{incorrectAnswers}</p>
            </div>
          </div>

          {/* Percentage */}
          <div className="flex items-center space-x-4 p-4 rounded-lg border border-blue-500 dark:border-blue-700">
            <ChartPieIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            <div>
              <p className="font-medium">Percentage</p>
              <p className="text-xl font-bold">{percentage}%</p>
            </div>
          </div>
        </div>
        <Link to="/" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 block text-center" onClick={handleGoHome}>
          <ArrowLeftIcon className="h-5 w-5 mr-2 inline-block" />
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ResultPage;
