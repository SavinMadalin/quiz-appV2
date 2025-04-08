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

const QuizPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [timer, setTimer] = useState(null);
  const [quizTimer, setQuizTimer] = useState(null); // New state for the overall quiz timer
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const questionRef = useRef(null); // Ref for the question container
  const [quizData, setQuizData] = useState([]); // New state to store quiz data
  const [quizStartTime, setQuizStartTime] = useState(null); // New state for quiz start time

  const { questions, currentQuestion, score, quizConfig, isQuizFinished } =
    useSelector((state) => state.quiz);
  const { user, isAuthenticated, isEmailVerified } = useSelector(
    (state) => state.user
  );

  // Determine the number of questions based on the mode
  const numQuestions = quizConfig.isMockInterviewMode ? 15 : 10;

  // Load the questions from a JSON file or Firestore
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      let allQuestions = [];

      try {
        if (quizConfig.category === "ai") {
          const storageRef = ref(storage, `questions/ai/ai.json`);
          const url = await getDownloadURL(storageRef);
          const response = await fetch(url);
          const data = await response.json();
          allQuestions = [...allQuestions, ...data];
        } else {
          if (
            quizConfig.subcategories &&
            Array.isArray(quizConfig.subcategories)
          ) {
            for (const subcategory of quizConfig.subcategories) {
              let fileName = `${subcategory}.json`;
              if (
                quizConfig.category === "backend-engineer" &&
                (!isAuthenticated || !isEmailVerified)
              ) {
                fileName = `${subcategory}-preview.json`;
              }
              const storageRef = ref(
                storage,
                `questions/${quizConfig.category}/${fileName}`
              );
              const url = await getDownloadURL(storageRef);
              const response = await fetch(url);
              const data = await response.json();
              if (data) {
                allQuestions = [...allQuestions, ...data];
              }
            }
          }
        }

        // Shuffle the questions
        for (let i = allQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allQuestions[i], allQuestions[j]] = [
            allQuestions[j],
            allQuestions[i],
          ];
        }

        // Slice the array to get the correct number of questions.
        const firstQuestions = allQuestions.slice(0, numQuestions);
        dispatch(setQuestions(firstQuestions));
        const initialQuizData = firstQuestions.map((question) => ({
          question: question.question,
          correctAnswer: question.correctAnswer,
          userAnswer: null,
        }));
        setQuizData(initialQuizData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setIsLoading(false);
        // Handle error (e.g., display an error message to the user)
      }
    };

    loadQuestions();
  }, [dispatch, quizConfig.category, quizConfig.subcategories, numQuestions]);

  useEffect(() => {
    setIsLastQuestion(currentQuestion === numQuestions - 1);
    console.log(
      "useEffect isLastQuestion - currentQuestion:",
      currentQuestion,
      "numQuestions:",
      numQuestions,
      "isLastQuestion:",
      isLastQuestion
    );
  }, [currentQuestion, numQuestions]);

  // Timer logic
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
    console.log(
      "handleNext - currentQuestion:",
      currentQuestion,
      "numQuestions:",
      numQuestions,
      "isLastQuestion:",
      isLastQuestion
    );
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
      <div className="min-h-screen flex justify-center items-center bg-blue-500 dark:bg-dark-blue-matte">
        <Spinner />
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const isTimerRed = timer <= 10; // Determine if timer should be red
  const isProgressBarGreen = isLastQuestion && isAnswered;
  const questionParts = extractCodeSnippets(currentQuestionData.question);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500 dark:bg-dark-blue-matte text-light-text dark:text-white p-6">
      {showConfirmPopup && (
        <ConfirmPopup
          message="Do you want to quit the quiz? Your score will not be registered"
          onConfirm={handleConfirmFinish}
          onCancel={handleCancelFinish}
        />
      )}
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Question {currentQuestion + 1}</h2>
          {/* Timer per question */}
          {!quizConfig.isMockInterviewMode &&
            quizConfig.timePerQuestion > 0 && (
              <div
                className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                  isTimerRed ? "text-red-500" : ""
                }`}
              >
                <ClockIcon className="h-4 w-4 mr-2" />
                <span className="text-mg font-bold">
                  {Math.floor(timer / 60)}:
                  {(timer % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}
          {/* Quiz Timer */}
          {quizConfig.isMockInterviewMode && (
            <div
              className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${
                quizTimer <= 60 ? "text-red-500" : ""
              }`}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              <span className="text-mg font-bold">
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
              className="mb-8 text-lg font-medium relative max-h-[15vh] overflow-y-auto overflow-x-hidden" // Added max-h and overflow-y and overflow-x-hidden
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
            <div className="grid grid-cols-1 gap-4">
              {currentQuestionData.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(answer)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-lg text-left transition-all flex items-center justify-between border border-gray-300 dark:border-gray-600 ${
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
                  {answer}
                  {isAnswered &&
                    (answer === currentQuestionData.correctAnswer ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                    ) : (
                      currentAnswer === answer &&
                      answer !== currentQuestionData.correctAnswer && (
                        <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
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
