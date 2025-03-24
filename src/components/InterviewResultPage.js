// src/components/InterviewResultPage.js
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { resetQuiz } from '../redux/quizSlice';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import OpenAI from 'openai'; // Import OpenAI

const InterviewResultPage = () => {
  const { score, quizConfig, timeTaken } = useSelector((state) => state.quiz);
  const [feedback, setFeedback] = useState('');
  const numQuestions = quizConfig.isMockInterviewMode ? 15 : 10;
  const percentage = (score / numQuestions) * 100;
  const passed = score >= 10;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [quizData, setQuizData] = useState([]);
  const [isFeedbackGenerated, setIsFeedbackGenerated] = useState(false); // New state variable
  const [resultId, setResultId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Format timeTaken into minutes and seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchDataAndGenerateFeedback = async () => {
      if (!quizConfig.isMockInterviewMode || isFeedbackGenerated) return; // Add isFeedbackGenerated check
      setIsLoading(true); // Set loading to true at the start

      if (!user || !user.uid) {
        console.error('User not logged in or user ID missing.');
        setIsLoading(false); // Set loading to false if there's an error
        return;
      }

      try {
        const q = query(
          collection(db, 'results'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        const lastResult = results[0];
        setQuizData(lastResult.quizData);
        setResultId(lastResult.id);

        const openai = new OpenAI({
          apiKey: process.env.REACT_APP_OPENAI_API_KEY, // Access the API key from environment variables
          dangerouslyAllowBrowser: true, // Add this line
        });

        // Create the prompt
        const prompt = `
          You are an expert interviewer.
          The user has just completed a mock interview in the category ${quizConfig.category}.
          The user answered ${score} out of ${numQuestions} questions correctly.
          The user took ${formatTime(timeTaken)} to complete the quiz.
          Here are the questions, correct answers, and the user's answers:
          ${lastResult.quizData.map((item, index) => `
            Question ${index + 1}: ${item.question}
            Correct Answer: ${item.correctAnswer}
            User's Answer: ${item.userAnswer || 'Not answered'}
          `).join('\n')}
          Provide a personalized feedback to the user.
          If the user passed, congratulate him.
          If the user failed, encourage him to keep practicing.
          Provide specific feedback on the user's answers.
          Suggest areas for improvement.
          Keep the feedback short and concise.
          Format the feedback with clear paragraphs and spacing.
        `;

        const response = await openai.chat.completions.create({ // Use openai.chat.completions.create
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        });

        const aiFeedback = response.choices[0].message.content; // Access the feedback correctly
        setFeedback(aiFeedback);
        setIsFeedbackGenerated(true); // Set the flag to true

        // Update the feedback in the database
        if (lastResult.id) {
          await updateDoc(doc(db, 'results', lastResult.id), {
            feedback: aiFeedback,
          });
        } else {
          console.error('lastResult.id is undefined');
          setFeedback("Error generating feedback. Please try again later.");
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        setFeedback("Error generating feedback. Please try again later.");
      } finally {
        setIsLoading(false); // Set loading to false when done
      }
    };

    fetchDataAndGenerateFeedback();
  }, [score, numQuestions, passed, quizConfig, timeTaken, user, isFeedbackGenerated]); // Add isFeedbackGenerated to the dependency array

  const handleGoHome = () => {
    dispatch(resetQuiz());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white p-6">
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Interview Result</h1>
        <div className="text-center mb-6">
          <p className="text-6xl font-bold mb-2">{percentage.toFixed(0)}%</p>
          <p className="text-lg">Correct Answers</p>
        </div>
        <div className="text-center mb-6">
          {passed ? (
            <div className="flex items-center justify-center gap-2 text-green-500 dark:text-green-400">
              <CheckCircleIcon className="h-8 w-8" />
              <p className="text-2xl font-bold">Passed</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-red-500 dark:text-red-400">
              <XCircleIcon className="h-8 w-8" />
              <p className="text-2xl font-bold">Failed</p>
            </div>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Feedback:</h2>
          {/* Scrollable Feedback Container */}
          <div className="max-h-60 overflow-y-auto p-4 border rounded-lg dark:border-gray-600">
            {/* Formatted Feedback */}
            {isLoading ? (
              <p className="text-gray-700 dark:text-gray-300">Loading feedback...</p>
            ) : (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{feedback}</p>
            )}
          </div>
        </div>
        {/* Display Time Taken */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <ClockIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          <p className="text-gray-700 dark:text-gray-300">Time taken: {formatTime(timeTaken)}</p>
        </div>
        <Link to="/" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105 block text-center" onClick={handleGoHome}>
          <ArrowLeftIcon className="h-5 w-5 mr-2 inline-block" />
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default InterviewResultPage;
