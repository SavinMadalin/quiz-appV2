import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setQuestions, answerQuestion, resetQuiz } from './redux/quizSlice';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import Spinner from './Spinner';
import ConfirmPopup from './components/ConfirmPopup';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowRightIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Import icons
import ProgressBar from './components/ProgressBar'; // Import ProgressBar

const QuizPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false); // New state variable
  const [showNextButton, setShowNextButton] = useState(false); // New state variable
  const numQuestions = 10; //we are always using 10 questions per quiz.

  const { questions, currentQuestion, score, quizConfig, isQuizFinished } = useSelector(state => state.quiz);
  const { user, isAuthenticated } = useSelector(state => state.user);

  // Load the questions from a JSON file or Firestore
  useEffect(() => {
    const loadQuestions = async () => {
      const response = await fetch(`/${quizConfig.category}.json`);
      const data = await response.json();
      // Slice the array to get only 10 questions.
      const firstTenQuestions = data.slice(0, 10);
      dispatch(setQuestions(firstTenQuestions));
      setIsLoading(false); // Set loading to false once questions are loaded
    };

    loadQuestions();
  }, [dispatch, quizConfig.category]);

  useEffect(() => {
    if (currentQuestion === numQuestions - 1) {
      setIsLastQuestion(true);
    } else {
      setIsLastQuestion(false);
    }
  }, [currentQuestion, numQuestions]);

  // Timer logic
  useEffect(() => {
    if (quizConfig.timePerQuestion > 0 && questions.length > 0 && !isAnswered) {
      setTimer(quizConfig.timePerQuestion * 60); // Convert minutes to seconds
    }
  }, [questions, quizConfig, currentQuestion, isAnswered]);

  useEffect(() => {
    if (timer === null) return; //timer is null

    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        clearInterval(interval);
        handleTimeOut(); // Call handleTimeOut when the timer reaches 0
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleAnswer = (selectedAnswer) => {
    if (isAnswered) return; // Prevent multiple answers
    setIsAnswered(true);
    setCurrentAnswer(selectedAnswer);
    setShowNextButton(true); // Show the Next button when an answer is selected
  };

  const handleNext = () => {
    dispatch(answerQuestion(currentAnswer));

    if (isLastQuestion) {
      if (isAuthenticated) {
        saveScore();
      }
      navigate('/result');
    } else {
       setCurrentAnswer(null);
       setIsAnswered(false);
       setShowNextButton(false); // Hide the Next button for the next question
    }
};

const handleTimeOut = () => {
  setCurrentAnswer(null); // set a null value, to show that it has not been answered.
  setIsAnswered(true); // set as answered, to display the answers
  setShowNextButton(true); // Show the Next button when the time reach 0
}

  const saveScore = async () => {
    if (!user || !user.uid) {
        console.error('User not logged in or user ID missing.');
        return;
      }
    try {
      await addDoc(collection(db, "results"), {
        userId: user.uid,
        score: score,
        timestamp: new Date(),
        category: quizConfig.category, // Save the category
        timePerQuestion: quizConfig.timePerQuestion, // Save the time per question
      });
      console.log("Score saved successfully!")
    } catch (error) {
      console.error('Error saving score: ', error);
    }
  };

  const handleQuit = () => {
    setShowConfirmPopup(true);
  };

  const handleConfirmFinish = () => {
    dispatch(resetQuiz());
    navigate('/');
  };

  const handleCancelFinish = () => {
    setShowConfirmPopup(false);
  };

  if (isLoading || questions.length === 0) {
    return <div className="min-h-screen flex justify-center items-center"><Spinner /></div>;
  }

  const currentQuestionData = questions[currentQuestion];
const isTimerRed = timer <= 10; // Determine if timer should be red
const isProgressBarGreen = isLastQuestion && isAnswered;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-blue-matte dark:bg-dark-blue-matte text-light-text dark:text-white p-6">
        {showConfirmPopup && (
            <ConfirmPopup
              message="Do you want to quit the quiz? Your score will not be registered"
              onConfirm={handleConfirmFinish}
              onCancel={handleCancelFinish}
            />
          )}
      <div className="bg-white dark:bg-dark-grey p-8 rounded-lg shadow-lg max-w-md w-full relative">
      <div className="absolute -top-1 -right-1"> {/* Reduced negative margins */}
          <button onClick={handleQuit} className="hover:bg-red-100 dark:hover:bg-red-700 text-red-500 px-3 py-3 rounded-full transition-colors flex items-center"> {/* Increased padding */}
             <XMarkIcon className="h-5 w-5" /> {/* Increased icon size */}
          </button>
        </div>
       <ProgressBar currentQuestion={currentQuestion} numQuestions={numQuestions} isCompleted={isProgressBarGreen} /> {/* Add the progress bar */}
       <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Question {currentQuestion + 1}</h2>
            {quizConfig.timePerQuestion > 0 && (
              <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 ${isTimerRed ? 'text-red-500' : ''}`}>
                <ClockIcon className="h-6 w-6 mr-2" />
                <span className="text-lg font-bold">
                   {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
         {/* Only render question data if it exists and the quiz is not finished */}
        {questions.length > 0 && !isQuizFinished && (
            <>
              <div className="mb-8 text-lg font-medium">{currentQuestionData.question}</div>
        <div className="grid grid-cols-1 gap-4">
          {currentQuestionData.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(answer)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-lg text-left border transition-all flex items-center justify-between ${
                isAnswered
                  ? answer === currentQuestionData.correctAnswer
                    ? 'border-green-500 bg-green-100 dark:bg-green-700'
                    : currentAnswer === answer && answer !== currentQuestionData.correctAnswer
                    ? 'border-red-500 bg-red-100 dark:bg-red-700'
                    : currentAnswer === null && answer === currentQuestionData.correctAnswer ?'border-green-500 bg-green-100 dark:bg-green-700': 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-500 opacity-50'
                  : 'border-blue-500 hover:bg-blue-600 hover:text-white'
              }`}
            >
              {answer}
              {isAnswered && (
                answer === currentQuestionData.correctAnswer ? <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" /> :
                currentAnswer === answer && answer !== currentQuestionData.correctAnswer && <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400"/>
              )}
            </button>
          ))}
        </div>
            </>
          )}
          {
              showNextButton && isAnswered && (
                  <div className="flex justify-end mt-6">
                       <button
                          onClick={handleNext}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                      >
                         <span className="mr-2 text-sm"> {isLastQuestion ? 'See Results' : 'Next'}</span> <ArrowRightIcon className="h-4 w-4" />
                      </button>
                  </div>
              )
          }

        <div className="mt-6 text-lg font-medium">
          Score: {score} / {numQuestions}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
