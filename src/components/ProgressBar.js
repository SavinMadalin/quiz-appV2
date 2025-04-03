// src/components/ProgressBar.js
const ProgressBar = ({ currentQuestion, numQuestions, isCompleted }) => {
  const progress = ((currentQuestion + 1) / numQuestions) * 100;

  return (
    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mb-8 overflow-hidden mt-4">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isCompleted ? "bg-green-500" : "bg-blue-600"
        }`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
