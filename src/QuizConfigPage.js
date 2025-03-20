// src/QuizConfigPage.js
import { useDispatch, useSelector } from 'react-redux';
import { setQuizConfig } from './redux/quizSlice';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import {
    ClockIcon, // For Time Per Question
    CpuChipIcon
  } from '@heroicons/react/24/outline'; // Import icons
import { useState, useEffect } from 'react';

const QuizConfigPage = () => {
  const dispatch = useDispatch();
  const quizConfig = useSelector(state => state.quiz.quizConfig);
   // Local state for draft settings
   const [draftSettings, setDraftSettings] = useState(quizConfig);

   useEffect(() => {
    setDraftSettings(quizConfig);
  }, [quizConfig]);

  const handleChange = (e) => {
    setDraftSettings({ ...draftSettings, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    dispatch(setQuizConfig(draftSettings));
  };
  const getCategoryIcon = () => {
    return <CpuChipIcon className="h-6 w-6 text-purple-500 dark:text-purple-400" />;
  };

  return (
   <div className="flex flex-col items-center justify-start min-h-screen p-6 bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white pt-20">
    <Navbar />
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full mt-20">
        <h1 className="text-3xl font-bold mb-8 text-center">Quiz Configuration</h1>

        <div className="mb-6">
          <label htmlFor="category" className="block font-medium mb-2 flex items-center gap-2">
            {getCategoryIcon()}
            Category:
          </label>
          <select
            id="category"
            name="category"
            value={draftSettings.category}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
            <option value="spring">Spring</option>
            <option value="artificial-intelligence">Artificial Intelligence</option>
          </select>
        </div>

        <div className="mb-8">
          <label htmlFor="timePerQuestion" className="block font-medium mb-2 flex items-center gap-2">
          <ClockIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Time Per Question:
          </label>
          <select
            id="timePerQuestion"
            name="timePerQuestion"
            value={draftSettings.timePerQuestion}
            onChange={handleChange}
            className="mt-1 p-3 border rounded-md bg-light-grey dark:bg-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="1">1 minute</option>
            <option value="2">2 minutes</option>
            <option value="0">No time</option>
          </select>
        </div>
        <Link
            to="/quiz"
            onClick={handleApply}
            className={`w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 block text-center`}
        >
            Start Quiz
        </Link>
      </div>
    </div>
  );
};

export default QuizConfigPage;
