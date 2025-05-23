// src/components/InterviewResultPage.js
import React, { useEffect, useState, useRef } from "react"; // Removed useRef
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db, model } from "../firebase";
import { resetQuiz } from "../redux/quizSlice";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  limit,
} from "firebase/firestore";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import TopNavbar from "./TopNavbar";

const InterviewResultPage = () => {
  const { score, quizConfig, timeTaken } = useSelector((state) => state.quiz);
  const [feedback, setFeedback] = useState("");
  const numQuestions = quizConfig.isMockInterviewMode ? 15 : 10;
  const percentage = ((score / numQuestions) * 100).toFixed(0);
  const passed = percentage >= 66;
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Initialize to false, set true only when fetching/generating
  const [lastResult, setLastResult] = useState(null);
  const [hasFeedbackBeenGenerated, setHasFeedbackBeenGenerated] =
    useState(false);
  // Removed isMounted ref

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchDataAndGenerateFeedback = async () => {
      // --- Start Guard Clauses ---
      if (!quizConfig.isMockInterviewMode) return; // Only run in interview mode
      if (!user || !user.uid) {
        console.error("User not logged in or user ID missing.");
        return; // Don't proceed without user
      }
      // Prevent execution if feedback is already generated or currently loading
      if (hasFeedbackBeenGenerated || isLoading) {
        return;
      }
      // --- End Guard Clauses ---

      setIsLoading(true); // Set loading *before* async operations

      try {
        // Fetch the latest result
        const q = query(
          collection(db, "results"),
          where("userId", "==", user.uid),
          where("quizType", "==", "interview"),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.warn("No interview results found for this user.");
          setFeedback(
            "No previous interview results found to generate feedback."
          ); // Inform user
          setHasFeedbackBeenGenerated(true); // Mark as 'handled' even if no results
          setIsLoading(false);
          return;
        }

        const fetchedLastResult = {
          ...querySnapshot.docs[0].data(),
          id: querySnapshot.docs[0].id,
        };
        setLastResult(fetchedLastResult); // Update lastResult state

        // Check if feedback exists in the fetched result
        if (fetchedLastResult.feedback) {
          setFeedback(fetchedLastResult.feedback);
          setHasFeedbackBeenGenerated(true); // Mark as generated
          setIsLoading(false); // Stop loading
          return; // Feedback found, no need to generate
        }

        // --- Generate Feedback (only if not found) ---
        const prompt = `
          You are an expert interviewer.
          The user has just completed a mock interview in the category ${
            quizConfig.category
          }.
          The user answered ${score} out of ${numQuestions} questions correctly (${percentage}%).
          The user took ${formatTime(timeTaken)} to complete the quiz.
          Here are the questions, correct answers, and the user's answers:
          ${fetchedLastResult?.quizData
            ?.map(
              (item, index) => `
            Question ${index + 1}: ${item.question}
            Correct Answer: ${item.correctAnswer}
            User's Answer: ${item.userAnswer || "Not answered"}
          `
            )
            .join("\n")}
          Provide personalized feedback to the user.
          If the user passed (scored ${percentage}% which is >= 66%), congratulate them.
          If the user failed, encourage them to keep practicing.
          Provide specific feedback on the user's answers, highlighting strengths and weaknesses.
          Suggest areas for improvement based on the incorrect answers.
          Keep the feedback concise and actionable, using clear paragraphs.
        `;

        const result = await model.generateContent(prompt);
        const aiFeedback = result.response.text();
        setFeedback(aiFeedback);

        // Update the document
        await updateDoc(doc(db, "results", fetchedLastResult.id), {
          feedback: aiFeedback,
        });

        setHasFeedbackBeenGenerated(true); // Mark as generated
      } catch (error) {
        console.error("Error fetching or generating feedback:", error);
        setFeedback("Error generating feedback. Please try again later.");
        // Consider setting hasFeedbackBeenGenerated to true even on error to prevent retries,
        // or implement a retry mechanism if desired. For now, we'll mark it handled.
        setHasFeedbackBeenGenerated(true);
      } finally {
        setIsLoading(false); // Ensure loading is always set to false
      }
    };

    // Call the function directly within useEffect
    fetchDataAndGenerateFeedback();

    // Refined Dependencies:
    // Only re-run if the user changes, the mode changes, or if we transition
    // from not having feedback generated to potentially needing it.
    // isLoading is included to help prevent race conditions.
  }, [
    user,
    quizConfig.isMockInterviewMode,
    hasFeedbackBeenGenerated,
    isLoading,
    dispatch,
    numQuestions,
    percentage,
    score,
    timeTaken,
    quizConfig.category,
  ]); // Added necessary variables used inside prompt

  const handleGoHome = () => {
    dispatch(resetQuiz());
  };

  const handleRetakeQuiz = () => {
    dispatch(resetQuiz());
    navigate("/quiz");
  };

  // ... rest of the component (return statement) remains the same ...
  return (
    // Reduced overall padding on small screens
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-6 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white pt-16 pb-24 lg:pl-52 lg:mt-8">
      <TopNavbar />
      {/* Reduced padding p-6, max-w-sm */}
      <div className="bg-white dark:bg-gray-800/90 p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full mt-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Interview Result
        </h1>
        {/* Reduced percentage size text-5xl, mb-1 */}
        <div className="text-center mb-6">
          <p className="text-5xl sm:text-6xl font-bold mb-1 text-indigo-600 dark:text-indigo-400">
            {percentage}%
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Correct Answers
          </p>
        </div>
        <div className="text-center mb-6">
          {passed ? (
            <div className="flex items-center justify-center gap-1.5 text-green-500 dark:text-green-400">
              <CheckCircleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              <p className="text-xl sm:text-2xl font-bold">Passed</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-red-500 dark:text-red-400">
              <XCircleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              <p className="text-xl sm:text-2xl font-bold">Failed</p>
            </div>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Feedback:
          </h2>
          <div className="max-h-48 sm:max-h-56 overflow-y-auto p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700/30">
            {isLoading && !feedback ? ( // Show loading only if feedback isn't already set
              <p className="text-gray-600 dark:text-gray-300 italic">
                Loading feedback...
              </p>
            ) : (
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {feedback || "Generating feedback..."}{" "}
                {/* Show placeholder if loading but feedback is empty */}
              </p>
            )}
          </div>
        </div>
        <div className="mb-6 flex items-center justify-center gap-1.5 text-sm sm:text-base text-gray-600 dark:text-gray-300">
          <ClockIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          <p>Time taken: {formatTime(timeTaken)}</p>
        </div>
        {/* Reduced gap-3, mt-6 */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {/* Retake Interview Button */}
          {/* Reduced padding py-2 px-4, text-sm */}
          <button
            onClick={handleRetakeQuiz}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-sm sm:text-base"
          >
            {/* Reduced icon size h-4 w-4, mr-1 */}
            <ArrowPathIcon className="h-5 w-5 mr-1.5 inline-block" />
            Retake Interview
          </button>
          {/* Go Home Button */}
          {/* Reduced padding py-2 px-4, text-sm */}
          <Link
            to="/"
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-sm sm:text-base"
            onClick={handleGoHome}
          >
            {/* Reduced icon size h-4 w-4, mr-1 */}
            <ArrowLeftIcon className="h-5 w-5 mr-1.5 inline-block" />
            Go Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewResultPage;
