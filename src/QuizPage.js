import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setQuestions,
  answerQuestion,
  resetQuiz,
  setTimeTaken,
} from "./redux/quizSlice";
import { useNavigate } from "react-router-dom";
import { db, storage } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import Spinner from "./Spinner";
import ConfirmPopup from "./components/ConfirmPopup";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ProgressBar from "./components/ProgressBar";
import CodeSnippet from "./components/CodeSnippet";
import {
  mainCategories,
  MOCK_INTERVIEW_QUESTIONS,
  CUSTOM_QUIZ_QUESTIONS,
} from "./constants"; // Import from constants.js
import TopNavbar from "./components/TopNavbar"; // Import TopNavbar component

const QuizPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [timer, setTimer] = useState(null);
  const [quizTimer, setQuizTimer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const questionRef = useRef(null);
  const [quizData, setQuizData] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);

  const { questions, currentQuestion, score, quizConfig, isQuizFinished } =
    useSelector((state) => state.quiz);
  const { user, isAuthenticated, isEmailVerified } = useSelector(
    (state) => state.user
  );

  const numQuestions = quizConfig.isMockInterviewMode
    ? MOCK_INTERVIEW_QUESTIONS
    : CUSTOM_QUIZ_QUESTIONS;

  // Helper to get the current category object
  const getCurrentCategory = (categoryValue) => {
    return mainCategories.find((cat) => cat.value === categoryValue);
  };

  // Load the questions from Firebase Storage
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      let allQuestions = [];
      const selectedCategoryValue = quizConfig.category;
      const selectedCategoryData = getCurrentCategory(selectedCategoryValue);

      if (!selectedCategoryData) {
        console.error("Selected category data not found!");
        setIsLoading(false);
        // Handle error appropriately
        return;
      }

      const hasSubcategories = selectedCategoryData.subcategories.length > 0;

      try {
        if (hasSubcategories) {
          // --- Load questions from selected subcategories ---
          const selectedSubcategories = quizConfig.subcategories || [];
          if (selectedSubcategories.length === 0) {
            console.warn("Category has subcategories, but none were selected.");
            // Optionally handle this case, e.g., show an error or load from a default subcategory
          }

          for (const subcategory of selectedSubcategories) {
            // --- Preview Logic (Example - Adjust if needed) ---
            // Apply preview logic only if applicable (e.g., for specific categories/subcategories)
            let usePreview = false;
            if (
              selectedCategoryValue === "core-languages" &&
              (!isAuthenticated || !isEmailVerified)
            ) {
              usePreview = true; // Example: only backend previews for guests
            }
            const fileName = usePreview
              ? `${subcategory}-preview.json`
              : `${subcategory}.json`;
            // --- End Preview Logic ---

            const filePath = `questions/${selectedCategoryValue}/${fileName}`;

            try {
              const storageRef = ref(storage, filePath);
              const url = await getDownloadURL(storageRef);
              const response = await fetch(url);
              if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
              const data = await response.json();
              if (data && Array.isArray(data)) {
                allQuestions = [...allQuestions, ...data];
              }
            } catch (subError) {
              console.warn(
                `Could not load questions for ${filePath}: ${subError.message}`
              );
              // Continue loading other subcategories even if one fails
            }
          }
        } else {
          // --- Load questions directly from the category file ---
          const fileName = `${selectedCategoryValue}.json`;
          const filePath = `questions/${fileName}`; // Path structure for categories without subfolders

          try {
            const storageRef = ref(storage, filePath);
            const url = await getDownloadURL(storageRef);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
            const data = await response.json();
            if (data && Array.isArray(data)) {
              allQuestions = data;
            }
          } catch (catError) {
            console.error(
              `Error loading questions for ${filePath}: ${catError.message}`
            );
            // Handle error (e.g., display an error message to the user)
          }
        }

        if (allQuestions.length === 0) {
          console.error(
            "No questions loaded. Check file paths and selections."
          );
          // Handle the case where no questions were loaded (show error, navigate back, etc.)
          setIsLoading(false);
          return;
        }

        // Shuffle the loaded questions
        for (let i = allQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allQuestions[i], allQuestions[j]] = [
            allQuestions[j],
            allQuestions[i],
          ];
        }

        // Slice the array to get the correct number of questions.
        const selectedQuestions = allQuestions.slice(0, numQuestions);
        dispatch(setQuestions(selectedQuestions));

        // Initialize quizData for tracking answers
        const initialQuizData = selectedQuestions.map((question) => ({
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer: null,
        }));
        setQuizData(initialQuizData);
      } catch (error) {
        console.error("General error loading questions:", error);
        // Handle general error
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [
    dispatch,
    quizConfig.category,
    quizConfig.subcategories,
    numQuestions,
    isAuthenticated,
    isEmailVerified,
  ]); // Added dependencies

  // ... (rest of the component remains the same: timer logic, handleAnswer, handleNext, saveScore, UI rendering, etc.) ...

  useEffect(() => {
    setIsLastQuestion(currentQuestion === numQuestions - 1);
  }, [currentQuestion, numQuestions]);

  useEffect(() => {
    if (quizConfig.isMockInterviewMode) {
      // Initialize the overall quiz timer to 15 minutes (900 seconds) only once
      if (quizTimer === null) {
        setQuizTimer(1200); // Set the timer to 15 minutes
      }
      setTimer(null); // Ensure the per-question timer is null in mock interview mode
    } else if (
      !quizConfig.isMockInterviewMode &&
      quizConfig.timePerQuestion > 0 &&
      questions.length > 0
    ) {
      // Regular mode: Set the timer for each question
      setTimer(quizConfig.timePerQuestion * 60); // Convert minutes to seconds
    }
  }, [questions, quizConfig, currentQuestion, quizTimer]);

  // Quiz Timer Effect (Mock Interview Mode)
  useEffect(() => {
    if (quizConfig.isMockInterviewMode && quizTimer !== null) {
      const interval = setInterval(() => {
        if (quizTimer > 0) {
          setQuizTimer((prevTimer) => prevTimer - 1); // Decrement the timer
        } else {
          clearInterval(interval);
          handleQuizTimeOut(); // Handle quiz timeout when the timer reaches 0
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [quizConfig.isMockInterviewMode, quizTimer]);

  // Timer per question Effect (Regular Mode)
  useEffect(() => {
    if (!quizConfig.isMockInterviewMode && timer !== null) {
      const interval = setInterval(() => {
        if (timer > 0) {
          setTimer((prevTimer) => prevTimer - 1); // Decrement the timer
        } else {
          clearInterval(interval);
          handleTimeOut(); // Call handleTimeOut when the timer reaches 0
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer, quizConfig.isMockInterviewMode]);

  // Set quiz start time when the component mounts
  useEffect(() => {
    if (quizConfig.isMockInterviewMode) {
      setQuizStartTime(new Date());
    }
  }, [quizConfig.isMockInterviewMode]);

  const handleAnswer = (selectedAnswer) => {
    if (isAnswered) return; // Prevent multiple answers
    setIsAnswered(true);
    setCurrentAnswer(selectedAnswer);
    setShowNextButton(true); // Show the Next button when an answer is selected
    setQuizData((prevQuizData) => {
      const updatedQuizData = [...prevQuizData];
      updatedQuizData[currentQuestion].userAnswer = selectedAnswer;
      return updatedQuizData;
    });
  };

  const handleNext = () => {
    // If the user has not answered, set the current answer to null
    if (!isAnswered) {
      setCurrentAnswer(null);
    }
    dispatch(answerQuestion(currentAnswer));

    if (isLastQuestion) {
      if (isAuthenticated) {
        saveScore();
      }
      navigate("/result");
    } else {
      setCurrentAnswer(null);
      setIsAnswered(false);
      setShowNextButton(false); // Hide the Next button for the next question
      // Reset the timer per question if not in mock interview mode and is not the last question
      if (
        !quizConfig.isMockInterviewMode &&
        quizConfig.timePerQuestion > 0 &&
        !isLastQuestion
      ) {
        // Added !isLastQuestion
        setTimer(quizConfig.timePerQuestion * 60);
      }
    }
  };

  const handleTimeOut = () => {
    setCurrentAnswer(null); // set a null value, to show that it has not been answered.
    setIsAnswered(true); // set as answered, to display the answers
    setShowNextButton(true); // Show the Next button when the time reach 0
  };

  const handleQuizTimeOut = () => {
    // Handle quiz timeout logic here
    if (isAuthenticated) {
      saveScore();
    }
    navigate("/result");
  };

  const saveScore = async () => {
    if (!user || !user.uid) {
      console.error("User not logged in or user ID missing.");
      return;
    }
    try {
      const endTime = new Date();
      const timeTaken = quizStartTime
        ? Math.round((endTime - quizStartTime) / 1000)
        : 0; // Calculate time taken in seconds
      dispatch(setTimeTaken(timeTaken)); // Dispatch the action to update the Redux store
      await addDoc(collection(db, "results"), {
        userId: user.uid,
        score: score,
        numQuestions: numQuestions,
        timestamp: new Date(),
        category: quizConfig.category, // Save the category
        timePerQuestion: quizConfig.timePerQuestion, // Save the time per question
        timeTaken: timeTaken, // Save the time taken
        quizType: quizConfig.isMockInterviewMode ? "interview" : "custom", // Save the quiz type
        quizData: quizData, // Save the quiz data
      });
      console.log("Score saved successfully!");
      navigate("/result"); // Navigate to the result page after saving the score
    } catch (error) {
      console.error("Error saving score: ", error);
    }
  };

  const handleQuit = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmFinish = () => {
    dispatch(resetQuiz());
    navigate("/");
  };

  const handleCancelFinish = () => {
    setShowConfirmPopup(false);
  };

  const extractCodeSnippets = (text) => {
    const codeRegex = /```([\w-]+)?\n?([\s\S]+?)\n?```|`([^`]+)`/g; // Updated regex
    const parts = [];
    let match;
    let lastIndex = 0;

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }
      if (match[0].startsWith("```")) {
        parts.push({
          type: "code",
          language: match[1] || "text",
          content: match[2],
        });
      } else {
        parts.push({ type: "inlineCode", content: match[3] }); // Inline code
      }
      lastIndex = codeRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    return parts;
  };

  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const isTimerRed = timer <= 10; // Determine if timer should be red
  const isProgressBarGreen = isLastQuestion && isAnswered;
  const questionParts = extractCodeSnippets(currentQuestionData.question);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-white p-6 pt-12">
      <TopNavbar />

      {showConfirmPopup && (
        <ConfirmPopup
          message="Do you want to quit the quiz? Your score will not be registered"
          onConfirm={handleConfirmFinish}
          onCancel={handleCancelFinish}
        />
      )}
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full relative overflow-x-hidden mt-8">
        {/* Added max-h and overflow-y */}
        <div className="absolute -top-1 -right-1">
          {/* Reduced negative margins */}
          <button
            onClick={handleQuit}
            className="hover:bg-red-100 dark:hover:bg-red-700 text-red-500 px-3 py-3 rounded-full transition-colors flex items-center"
          >
            {/* Increased padding */}
            <XMarkIcon className="h-5 w-5" />
            {/* Increased icon size */}
          </button>
        </div>
        <ProgressBar
          currentQuestion={currentQuestion}
          numQuestions={numQuestions}
          isCompleted={isProgressBarGreen}
        />
        {/* Add the progress bar */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Question {currentQuestion + 1}</h2>
          {/* Timer per question */}
          {!quizConfig.isMockInterviewMode &&
            quizConfig.timePerQuestion > 0 && (
              <div
                className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md ${
                  isTimerRed ? "text-red-500" : ""
                }`}
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                <span className="text-base font-bold">
                  {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
          {/* Quiz Timer */}
          {quizConfig.isMockInterviewMode && (
            <div
              className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md ${
                quizTimer <= 60 ? "text-red-500" : ""
              }`}
            >
              <ClockIcon className="h-3 w-3 mr-2" />
              <span className="text-base font-bold">
                {Math.floor(quizTimer / 60)}:
                {(quizTimer % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
        {/* Only render question data if it exists and the quiz is not finished */}
        {questions.length > 0 && !isQuizFinished && (
          <>
            <div
              className="mb-5 text-base font-medium relative max-h-[20vh] overflow-y-auto overflow-x-hidden " // Added max-h and overflow-y and overflow-x-hidden
              ref={questionRef}
            >
              <div className="question-text break-words">
                {questionParts.map((part, index) => (
                  <React.Fragment key={index}>
                    {part.type === "text" && (
                      <p className="mb-2 break-words">{part.content}</p>
                    )}
                    {part.type === "code" && (
                      <CodeSnippet
                        code={part.content}
                        language={part.language}
                      />
                    )}
                    {part.type === "inlineCode" && (
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-sm break-words">
                        {part.content}
                      </code>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {currentQuestionData.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(answer)}
                  disabled={isAnswered}
                  className={`w-full p-3 rounded-lg text-base text-left transition-all flex items-center justify-between border border-gray-300 dark:border-gray-400 ${
                    isAnswered
                      ? answer === currentQuestionData.correctAnswer
                        ? "bg-green-100 dark:bg-green-700"
                        : currentAnswer === answer &&
                          answer !== currentQuestionData.correctAnswer
                        ? "bg-red-100 dark:bg-red-700"
                        : currentAnswer === null &&
                          answer === currentQuestionData.correctAnswer
                        ? "bg-green-100 dark:bg-green-700"
                        : "dark:bg-gray-700 text-gray-500 opacity-50"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-105" // Removed hover:bg-blue-600 hover:text-white and added active:scale-105
                  }`}
                >
                  <span className="flex-grow mr-2 break-words">{answer}</span>
                  {isAnswered &&
                    (answer === currentQuestionData.correctAnswer ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      currentAnswer === answer &&
                      answer !== currentQuestionData.correctAnswer && (
                        <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0" />
                      )
                    ))}
                </button>
              ))}
            </div>
          </>
        )}
        {showNextButton && isAnswered && (
          <div className="absolute bottom-8 right-8">
            <button
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
            >
              <span className="mr-2 text-sm">
                {" "}
                {isLastQuestion ? "See Results" : "Next"}
              </span>{" "}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-6 text-lg font-medium">
          Score: {score} / {numQuestions}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
